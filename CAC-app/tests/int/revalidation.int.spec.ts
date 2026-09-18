import { revalidateTag } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { revalidateProject } from '@/collections/Projects/hooks/revalidateProject'
import { revalidateCategory } from '@/collections/ServiceCategories/hooks/revalidateCategory'
import { revalidateService } from '@/collections/Services/hooks/revalidateService'
import { shouldRevalidatePublishedChange } from '@/utilities/shouldRevalidatePublishedChange'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }))

describe('published-content revalidation boundary', () => {
  it.each([
    ['new draft created locally while opening Admin form', { _status: 'draft' }, {}, undefined, false],
    ['draft autosave before first publish', { _status: 'draft' }, { _status: 'draft' }, 'true', false],
    ['draft autosave of a published document', { _status: 'draft' }, { _status: 'published' }, 'true', false],
    ['first publish', { _status: 'published' }, { _status: 'draft' }, 'false', true],
    ['published update', { _status: 'published' }, { _status: 'published' }, 'false', true],
    ['publish overrides a draft query', { _status: 'published' }, { _status: 'draft' }, 'true', true],
    ['unpublish', { _status: 'draft' }, { _status: 'published' }, 'false', true],
  ] as const)('%s', (_name, doc, previousDoc, draftQuery, expected) => {
    expect(shouldRevalidatePublishedChange(doc, previousDoc, draftQuery)).toBe(expected)
  })

  describe.each([
    ['project', revalidateProject],
    ['service', revalidateService],
    ['service category', revalidateCategory],
  ] as const)('%s hook', (_name, hook) => {
    beforeEach(() => vi.mocked(revalidateTag).mockClear())

    it('does not revalidate when Payload creates the initial Admin draft during render', async () => {
      await hook({
        doc: { id: 1, _status: 'draft' },
        previousDoc: {},
        req: { context: {}, payload: { logger: { info: vi.fn() } }, query: {} },
      } as never)
      expect(revalidateTag).not.toHaveBeenCalled()
    })

    it('still revalidates after a published mutation', async () => {
      await hook({
        doc: { id: 1, _status: 'published', slug: 'example' },
        previousDoc: { id: 1, _status: 'draft' },
        req: { context: {}, payload: { logger: { info: vi.fn() } }, query: {} },
      } as never)
      expect(revalidateTag).toHaveBeenCalled()
    })
  })
})
