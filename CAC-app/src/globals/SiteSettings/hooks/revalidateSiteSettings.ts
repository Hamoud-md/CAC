import type { GlobalAfterChangeHook } from 'payload'
import { safeRevalidateTag } from '@/utilities/revalidate'

export const revalidateSiteSettings: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating site settings')
    safeRevalidateTag('site-settings')
  }
  return doc
}
