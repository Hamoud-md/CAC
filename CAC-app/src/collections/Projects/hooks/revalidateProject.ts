import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { safeRevalidateTag } from '@/utilities/revalidate'
import { shouldRevalidatePublishedChange } from '@/utilities/shouldRevalidatePublishedChange'

import type { Project } from '../../../payload-types'

export const revalidateProject: CollectionAfterChangeHook<Project> = ({
  doc,
  previousDoc,
  req: { payload, context, query },
}) => {
  if (context.disableRevalidate || !shouldRevalidatePublishedChange(doc, previousDoc, query.draft)) return doc
  payload.logger.info(`Revalidating projects (changed: ${doc.id})`)
  safeRevalidateTag('projects')
  safeRevalidateTag('projects-sitemap')

  const slugs = new Set<string>()
  const collect = (d?: Partial<Project> | null) => {
    const s = d?.slug
    if (typeof s === 'string') slugs.add(s)
    else if (s && typeof s === 'object')
      Object.values(s).forEach((v) => typeof v === 'string' && slugs.add(v))
  }
  collect(doc)
  collect(previousDoc)
  slugs.forEach((s) => safeRevalidateTag(`project:${s}`))
  return doc
}

export const revalidateProjectDelete: CollectionAfterDeleteHook<Project> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    safeRevalidateTag('projects')
    safeRevalidateTag('projects-sitemap')
  }
  return doc
}
