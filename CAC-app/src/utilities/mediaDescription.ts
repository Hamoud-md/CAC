import type { Media } from '@/payload-types'

/** Visible media text intentionally comes from the localized Media.alt field. */
export function getMediaDescription(resource: Media | null | undefined): string | null {
  if (!resource || resource.decorative || typeof resource.alt !== 'string') return null
  const description = resource.alt.trim()
  return description || null
}
