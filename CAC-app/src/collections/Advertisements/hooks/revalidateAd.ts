import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { safeRevalidateTag } from '@/utilities/revalidate'

export const revalidateAd: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating advertisements')
    safeRevalidateTag('ads')
  }
  return doc
}

export const revalidateAdDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) safeRevalidateTag('ads')
  return doc
}
