import type { CollectionAfterChangeHook } from 'payload'

import { DEFAULT_LOCALE, isLocale } from '@/lib/locales'

type Prefixed = 'services' | 'projets' | ''

/**
 * When a published doc's slug changes (in the locale being edited), create a
 * redirect from the old localized path to the new one (context.md §10, §16).
 */
export const createSlugRedirect =
  (pathPrefix: Prefixed): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req, collection }) => {
    if (req.context.disableRevalidate) return doc
    if (doc._status !== 'published') return doc

    const oldSlug = typeof previousDoc?.slug === 'string' ? previousDoc.slug : undefined
    const newSlug = typeof doc?.slug === 'string' ? doc.slug : undefined
    if (!oldSlug || !newSlug || oldSlug === newSlug) return doc

    const locale = isLocale(req.locale) ? req.locale : DEFAULT_LOCALE
    const seg = pathPrefix ? `/${pathPrefix}` : ''
    const from = `/${locale}${seg}/${oldSlug}`
    const to = `/${locale}${seg}/${newSlug}`

    const existing = await req.payload.find({
      collection: 'redirects',
      where: { from: { equals: from } },
      limit: 1,
      req,
    })
    const data = { from, to: { type: 'custom' as const, url: to } }
    if (existing.docs[0]) {
      await req.payload.update({ collection: 'redirects', id: existing.docs[0].id, data, req })
    } else {
      await req.payload.create({ collection: 'redirects', data, req })
    }
    req.payload.logger.info(`Redirect: ${from} -> ${to} (${collection.slug})`)
    return doc
  }
