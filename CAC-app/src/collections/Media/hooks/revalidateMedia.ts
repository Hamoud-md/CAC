import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { MEDIA_CONTENT_TAG } from '@/utilities/cacheTags'
import { safeExpireTag } from '@/utilities/revalidate'

export const revalidateMedia: CollectionAfterChangeHook = ({ doc, req: { context, payload } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating media-dependent content (changed: ${doc.id})`)
    safeExpireTag(MEDIA_CONTENT_TAG)
  }
  return doc
}

export const revalidateMediaDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) safeExpireTag(MEDIA_CONTENT_TAG)
  return doc
}
