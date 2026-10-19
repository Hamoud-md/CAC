import { APIError, type CollectionBeforeDeleteHook, type Field } from 'payload'

type RecordData = Record<string, unknown>
const object = (value: unknown): value is RecordData => Boolean(value && typeof value === 'object' && !Array.isArray(value))
const sameID = (value: unknown, id: number | string): boolean =>
  value !== null && value !== undefined && String(object(value) ? value.id : value) === String(id)

// Lexical links/uploads carry their collection explicitly, including inside blocks.
function embeddedReference(value: unknown, target: string, id: number | string): boolean {
  if (Array.isArray(value)) return value.some((entry) => embeddedReference(entry, target, id))
  if (!object(value)) return false
  if (value.relationTo === target && sameID(value.value, id)) return true
  return Object.values(value).some((entry) => embeddedReference(entry, target, id))
}

export function hasContentReference(fields: Field[], data: unknown, target: string, id: number | string): boolean {
  if (!object(data)) return false
  return fields.some((field) => {
    if (field.type === 'tabs') return field.tabs.some((tab) =>
      hasContentReference(tab.fields, 'name' in tab && tab.name ? data[tab.name] : data, target, id))
    if (!('name' in field) || !field.name) return 'fields' in field &&
      hasContentReference(field.fields, data, target, id)
    const raw = data[field.name]
    const values = 'localized' in field && field.localized && object(raw) ? Object.values(raw) : [raw]
    return values.some((value) => {
      if (field.type === 'upload' || field.type === 'relationship') {
        const entries = Array.isArray(value) ? value : [value]
        return entries.some((entry) => typeof field.relationTo === 'string'
          ? field.relationTo === target && sameID(entry, id)
          : object(entry) && entry.relationTo === target && sameID(entry.value, id))
      }
      if (field.type === 'richText') return embeddedReference(value, target, id)
      if (field.type === 'blocks') return Array.isArray(value) && value.some((entry) => {
        if (!object(entry)) return false
        const block = field.blocks.find((candidate) => typeof candidate !== 'string' && candidate.slug === entry.blockType)
        return block && typeof block !== 'string' && hasContentReference(block.fields, entry, target, id)
      })
      if ('fields' in field) return (Array.isArray(value) ? value : [value]).some((entry) =>
        hasContentReference(field.fields, entry, target, id))
      return false
    })
  })
}

/** Reject deletion before Payload removes files/versions; never rewrite a reference. */
export const protectReferencedContent: CollectionBeforeDeleteHook = async ({ id, collection, req }) => {
  const { payload } = req
  const reject = (source: string): never => {
    throw new APIError(`Suppression impossible : contenu référencé par ${source}. Remplacez les références avant de supprimer. Les anciennes versions peuvent aussi utiliser ce contenu.`, 409)
  }
  // Bounded pages, all locales, no population. Include saved drafts and history so
  // deleting an asset cannot silently break a retained version or scheduled draft.
  for (const source of payload.config.collections) {
    if (!['pages', 'service-categories', 'services', 'projects', 'media', 'advertisements', 'redirects'].includes(source.slug)) continue
    for (const versions of source.versions ? [false, true] : [false]) {
      let page = 1
      let more = true
      while (more) {
        const args = { collection: source.slug, locale: 'all' as const, fallbackLocale: false as const, depth: 0, limit: 100, page, overrideAccess: true, req }
        const result = versions ? await payload.findVersions(args) : await payload.find({ ...args, draft: true })
        for (const document of result.docs) {
          const record = document as unknown as RecordData
          if (source.slug === collection.slug && sameID(versions ? record.parent : record.id, id)) continue
          if (hasContentReference(source.fields, versions ? record.version : record, collection.slug, id)) reject(`${source.slug} #${String(record.id)}`)
        }
        more = result.hasNextPage
        page++
      }
    }
  }
  for (const source of payload.config.globals) {
    const document = await payload.findGlobal({ slug: source.slug, locale: 'all', fallbackLocale: false, depth: 0, overrideAccess: true, req })
    if (hasContentReference(source.fields, document, collection.slug, id)) reject(source.slug)
    if (source.versions) {
      let page = 1
      let more = true
      while (more) {
        const result = await payload.findGlobalVersions({ slug: source.slug, locale: 'all', fallbackLocale: false, depth: 0, limit: 100, page, overrideAccess: true, req })
        for (const version of result.docs) if (hasContentReference(source.fields, version.version, collection.slug, id)) reject(`${source.slug} (version)`)
        more = result.hasNextPage
        page++
      }
    }
  }
}
