import { revalidateTag as nextRevalidateTag } from 'next/cache'

/**
 * revalidateTag throws ("static generation store missing") when called outside a
 * request/render — e.g. from the seed script or a CLI task. Payload hooks run in
 * both contexts, so swallow that specific case.
 */
export function safeRevalidateTag(tag: string): void {
  try {
    nextRevalidateTag(tag, 'max')
  } catch (err) {
    if (err instanceof Error && err.message.includes('static generation store missing')) return
    throw err
  }
}

/** Expire a tag synchronously so the next request cannot receive stale CMS data. */
export function safeExpireTag(tag: string): void {
  try {
    nextRevalidateTag(tag, { expire: 0 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('static generation store missing')) return
    throw err
  }
}
