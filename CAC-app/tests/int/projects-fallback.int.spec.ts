// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { find, getPayload } = vi.hoisted(() => ({ find: vi.fn(), getPayload: vi.fn() }))
vi.mock('next/cache', () => ({ unstable_cache: (fn: (...args: never[]) => unknown) => fn }))
vi.mock('payload', () => ({ getPayload }))
vi.mock('@payload-config', () => ({ default: Promise.resolve({}) }))
vi.mock('@/utilities/applyExactMediaText', () => ({ applyExactMediaText: (_payload: unknown, data: unknown) => data }))

import { getProjectBySlug } from '@/lib/data'

describe('published project locale fallback', () => {
  beforeEach(() => { vi.clearAllMocks(); getPayload.mockResolvedValue({ find }) })

  it('uses a translated slug directly when it exists', async () => {
    const project = { id: 1, slug: 'english-project', title: 'English title' }
    find.mockResolvedValueOnce({ docs: [project] })
    await expect(getProjectBySlug('english-project', 'en')).resolves.toEqual(project)
    expect(find).toHaveBeenCalledTimes(1)
  })

  it('resolves a displayed fallback slug by ID while keeping the requested language and published filters', async () => {
    const project = { id: 1, slug: 'french-slug', title: 'English project title' }
    find.mockResolvedValueOnce({ docs: [] }).mockResolvedValueOnce({ docs: [{ id: 1 }] }).mockResolvedValueOnce({ docs: [project] })
    await expect(getProjectBySlug('french-slug', 'en')).resolves.toEqual(project)
    expect(find.mock.calls.map(([query]) => query.locale)).toEqual(['en', 'fr', 'en'])
    for (const [query] of find.mock.calls) expect(query.where._status).toEqual({ equals: 'published' })
    expect(find.mock.calls[2]?.[0].where.id).toEqual({ equals: 1 })
  })

  it('does not return a project whose actual translated slug differs', async () => {
    find.mockResolvedValueOnce({ docs: [] }).mockResolvedValueOnce({ docs: [{ id: 1 }] }).mockResolvedValueOnce({ docs: [{ id: 1, slug: 'different-arabic-slug' }] })
    await expect(getProjectBySlug('french-slug', 'ar')).resolves.toBeNull()
  })

  it('keeps a missing project missing without publishing or creating anything', async () => {
    find.mockResolvedValue({ docs: [] })
    await expect(getProjectBySlug('missing', 'fr')).resolves.toBeNull()
    expect(find).toHaveBeenCalledTimes(1)
  })
})
