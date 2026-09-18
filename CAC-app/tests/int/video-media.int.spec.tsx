import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { VideoMedia } from '@/components/Media/VideoMedia'
import type { Media as MediaType } from '@/payload-types'

afterEach(cleanup)

describe('video media', () => {
  it('loads a new URL when the filename changes on the same Media record', () => {
    const original = { id: 1, filename: 'first.webm', mimeType: 'video/webm' } as MediaType
    const view = render(<VideoMedia resource={original} />)
    const first = view.container.querySelector('video')
    expect(first?.getAttribute('src')).toContain('first.webm')

    view.rerender(<VideoMedia resource={{ ...original, filename: 'second.webm' }} />)
    const second = view.container.querySelector('video')
    expect(second?.getAttribute('src')).toContain('second.webm')
    expect(second).not.toBe(first)
  })
})
