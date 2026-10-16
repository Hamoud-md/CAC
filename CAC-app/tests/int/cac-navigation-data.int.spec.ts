import { beforeEach, describe, expect, it, vi } from 'vitest'

const { find, getPayload } = vi.hoisted(() => ({ find: vi.fn(), getPayload: vi.fn() }))
vi.mock('next/cache', () => ({ unstable_cache: (fn: (...args: never[]) => unknown) => fn }))
vi.mock('payload', () => ({ getPayload }))
vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('@/utilities/applyExactMediaText', () => ({ applyExactMediaText: (_payload: unknown, data: unknown) => data }))

import { getNav } from '@/lib/data'

describe('Payload service navigation tree', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('uses published navigation filters and Payload ordering, then maps services only to their parent', async () => {
    const categories = [
      { id: 20, title: 'Second category', slug: 'second' },
      { id: 10, title: 'First category', slug: 'first' },
    ]
    const services = [
      { id: 202, title: 'Second child B', slug: 'b', category: { id: 20 } },
      { id: 101, title: 'First child', slug: 'first-child', category: 10 },
      { id: 201, title: 'Second child A', slug: 'a', category: 20 },
    ]
    find.mockImplementation(async ({ collection }: { collection: string }) => ({ docs: collection === 'service-categories' ? categories : services }))
    getPayload.mockResolvedValue({ find })

    const nav = await getNav('fr')

    expect(find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'service-categories', locale: 'fr', sort: '_order', pagination: false,
      where: { _status: { equals: 'published' }, showInNav: { equals: true } },
    }))
    expect(find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'services', locale: 'fr', sort: '_order', pagination: false,
      where: { _status: { equals: 'published' } },
    }))
    expect(nav.map(({ slug }) => slug)).toEqual(['second', 'first'])
    expect(nav[0]?.services.map(({ slug }) => slug)).toEqual(['b', 'a'])
    expect(nav[1]?.services.map(({ slug }) => slug)).toEqual(['first-child'])
    expect(nav.map(({ hasPage }) => hasPage)).toEqual([false, false])
  })

  it('marks an empty published category as a direct page destination', async () => {
    find.mockImplementation(async ({ collection }: { collection: string }) => ({ docs: collection === 'service-categories' ? [{ id: 1, title: 'Category', slug: 'category' }] : [] }))
    getPayload.mockResolvedValue({ find })
    await expect(getNav('en')).resolves.toEqual([expect.objectContaining({ slug: 'category', hasPage: true, services: [] })])
  })
})
