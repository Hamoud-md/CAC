import type { Payload } from 'payload'

import type { Locale } from '@/lib/locales'

type MutableRecord = Record<string, unknown>

function isPopulatedMedia(value: MutableRecord): boolean {
  return 'id' in value && 'filename' in value && 'mimeType' in value
}

function collectMediaIDs(value: unknown, ids: Set<number | string>, seen: WeakSet<object>): void {
  if (!value || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)
  if (Array.isArray(value)) {
    value.forEach((item) => collectMediaIDs(item, ids, seen))
    return
  }
  const record = value as MutableRecord
  if (
    isPopulatedMedia(record) &&
    (typeof record.id === 'number' || typeof record.id === 'string')
  ) {
    ids.add(record.id)
  }
  Object.values(record).forEach((item) => collectMediaIDs(item, ids, seen))
}

function replaceMediaText(
  value: unknown,
  exactByID: Map<string, { alt?: string | null; caption?: unknown }>,
  seen: WeakSet<object>,
): void {
  if (!value || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)
  if (Array.isArray(value)) {
    value.forEach((item) => replaceMediaText(item, exactByID, seen))
    return
  }
  const record = value as MutableRecord
  if (isPopulatedMedia(record)) {
    const exact = exactByID.get(String(record.id))
    if (exact) {
      record.alt = exact.alt ?? null
      record.caption = exact.caption ?? null
    }
  }
  Object.values(record).forEach((item) => replaceMediaText(item, exactByID, seen))
}

/**
 * Payload's site-wide locale fallback is useful for page copy, but an explicitly
 * cleared media description must stay empty. Re-read only Media text without a
 * fallback and overlay it onto populated relationships.
 */
export async function applyExactMediaText<T>(
  payload: Payload,
  value: T,
  locale: Locale,
): Promise<T> {
  const ids = new Set<number | string>()
  collectMediaIDs(value, ids, new WeakSet())
  if (ids.size === 0) return value

  const exact = await payload.find({
    collection: 'media',
    locale,
    fallbackLocale: false,
    depth: 0,
    limit: ids.size,
    pagination: false,
    where: { id: { in: [...ids] } },
  })
  const exactByID = new Map(
    exact.docs.map((media) => [
      String(media.id),
      { alt: media.alt ?? null, caption: media.caption ?? null },
    ]),
  )
  replaceMediaText(value, exactByID, new WeakSet())
  return value
}
