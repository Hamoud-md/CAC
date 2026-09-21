import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MEDIA_CONTENT_TAG } from '@/utilities/cacheTags'

const cacheCalls = vi.hoisted(() => [] as { keys: string[]; tags: string[] }[])

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn(
    (_callback: unknown, keys: string[], options: { tags: string[] }) => async () => {
      cacheCalls.push({ keys, tags: options.tags })
      return []
    },
  ),
}))
vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))

describe('media-dependent query tags', () => {
  beforeEach(() => cacheCalls.splice(0))

  it('tags every cached public query that returns populated Media', async () => {
    const data = await import('@/lib/data')
    const { selectAds } = await import('@/lib/ads')

    await Promise.all([
      data.getSiteSettings('fr'),
      data.getHomepage('fr'),
      data.getCategoryBySlug('category', 'fr'),
      data.getServiceBySlug('category', 'service', 'fr'),
      data.getProjects('fr'),
      data.getProjectBySlug('project', 'fr'),
      data.getFeaturedProjects('fr'),
      selectAds({ type: 'all' }, 'fr'),
    ])

    expect(cacheCalls).toHaveLength(8)
    cacheCalls.forEach(({ tags }) => expect(tags).toContain(MEDIA_CONTENT_TAG))
  })
})
