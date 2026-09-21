import { revalidateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { revalidateMedia, revalidateMediaDelete } from '@/collections/Media/hooks/revalidateMedia'
import type { Media } from '@/payload-types'
import { MEDIA_CONTENT_TAG } from '@/utilities/cacheTags'
import { getMediaDescription } from '@/utilities/mediaDescription'

const cacheState = vi.hoisted(() => ({ generation: 0 }))

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn((tag: string, profile: unknown) => {
    if (tag === 'media-content' && JSON.stringify(profile) === JSON.stringify({ expire: 0 })) {
      cacheState.generation += 1
    }
  }),
}))

const hookArgs = (doc: Partial<Media>, disableRevalidate = false) =>
  ({
    doc,
    previousDoc: {},
    req: {
      context: { disableRevalidate },
      payload: { logger: { info: vi.fn() } },
    },
  }) as never

describe('Media-dependent cache invalidation', () => {
  beforeEach(() => {
    cacheState.generation = 0
    vi.mocked(revalidateTag).mockClear()
  })

  it.each([
    ['fr', 'Description A', 'Description B'],
    ['ar', 'الوصف أ', 'الوصف ب'],
    ['en', 'Description A', 'Description B'],
  ] as const)(
    'refreshes cached %s text immediately after set and clear',
    async (_locale, initial, updated) => {
      let storedAlt: string | null = initial
      let cachedGeneration = -1
      let cachedMedia: Media | undefined
      const renderCachedDescription = () => {
        if (cachedGeneration !== cacheState.generation) {
          cachedGeneration = cacheState.generation
          cachedMedia = { id: 7, alt: storedAlt, decorative: false } as Media
        }
        return getMediaDescription(cachedMedia)
      }

      expect(renderCachedDescription()).toBe(initial)
      storedAlt = updated
      expect(renderCachedDescription()).toBe(initial)

      await revalidateMedia(hookArgs({ id: 7, alt: updated }))
      expect(revalidateTag).toHaveBeenLastCalledWith(MEDIA_CONTENT_TAG, { expire: 0 })
      expect(renderCachedDescription()).toBe(updated)

      storedAlt = null
      await revalidateMedia(hookArgs({ id: 7, alt: null }))
      expect(renderCachedDescription()).toBeNull()
    },
  )

  it('invalidates media-dependent content after deletion', async () => {
    await revalidateMediaDelete(hookArgs({ id: 7 }))
    expect(revalidateTag).toHaveBeenCalledWith(MEDIA_CONTENT_TAG, { expire: 0 })
  })

  it('respects the existing revalidation opt-out context', async () => {
    await revalidateMedia(hookArgs({ id: 7 }, true))
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
