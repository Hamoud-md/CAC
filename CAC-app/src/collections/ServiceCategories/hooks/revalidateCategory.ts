import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { safeRevalidateTag } from '@/utilities/revalidate'
import { shouldRevalidatePublishedChange } from '@/utilities/shouldRevalidatePublishedChange'

export const revalidateCategory: CollectionAfterChangeHook = ({ doc, previousDoc, req: { payload, context, query } }) => {
  if (!context.disableRevalidate && shouldRevalidatePublishedChange(doc, previousDoc, query.draft)) {
    payload.logger.info('Revalidating service categories')
    safeRevalidateTag('service-categories')
    safeRevalidateTag('services') // nav is built from both
  }
  return doc
}

export const revalidateCategoryDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    safeRevalidateTag('service-categories')
    safeRevalidateTag('services')
  }
  return doc
}
