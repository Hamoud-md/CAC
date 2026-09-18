import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { safeRevalidateTag } from '@/utilities/revalidate'
import { shouldRevalidatePublishedChange } from '@/utilities/shouldRevalidatePublishedChange'

import type { Service } from '../../../payload-types'

/** Immediate publish, no redeploy (context.md §11.4). */
export const revalidateService: CollectionAfterChangeHook<Service> = ({
  doc,
  previousDoc,
  req: { payload, context, query },
}) => {
  if (context.disableRevalidate || !shouldRevalidatePublishedChange(doc, previousDoc, query.draft)) return doc

  payload.logger.info(`Revalidating services (changed: ${doc.id})`)
  safeRevalidateTag('services')
  safeRevalidateTag('services-sitemap')

  const slugs = new Set<string>()
  const collect = (d?: Partial<Service> | null) => {
    const s = d?.slug
    if (typeof s === 'string') slugs.add(s)
    else if (s && typeof s === 'object') Object.values(s).forEach((v) => typeof v === 'string' && slugs.add(v))
  }
  collect(doc)
  collect(previousDoc)
  slugs.forEach((s) => safeRevalidateTag(`service:${s}`))

  return doc
}

export const revalidateServiceDelete: CollectionAfterDeleteHook<Service> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    safeRevalidateTag('services')
    safeRevalidateTag('services-sitemap')
  }
  return doc
}
