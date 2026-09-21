import { cleanup, render, screen } from '@testing-library/react'
import type { Payload } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { applyExactMediaText } from '@/utilities/applyExactMediaText'
import { getMediaDescription } from '@/utilities/mediaDescription'

vi.mock('@/components/Media/ImageMedia', () => ({
  ImageMedia: () => <div data-testid="rendered-image" />,
}))
vi.mock('@/components/Media/VideoMedia', () => ({
  VideoMedia: () => <video />,
}))

afterEach(cleanup)

const media = (overrides: Partial<MediaType> = {}) =>
  ({
    id: 7,
    filename: 'example.jpg',
    mimeType: 'image/jpeg',
    alt: null,
    decorative: false,
    ...overrides,
  }) as MediaType

describe('visible media descriptions', () => {
  it('renders the exact localized Media description beneath images and videos', () => {
    const view = render(<Media resource={media({ alt: 'Test description' })} />)
    expect(screen.getByText('Test description')).toBeTruthy()

    view.rerender(<Media resource={media({ alt: 'Description vidéo', mimeType: 'video/mp4' })} />)
    expect(screen.getByText('Description vidéo')).toBeTruthy()
  })

  it('renders nothing after the description is cleared', () => {
    const view = render(<Media resource={media({ alt: 'Old description' })} />)
    expect(screen.getByText('Old description')).toBeTruthy()

    view.rerender(<Media resource={media({ alt: null })} />)
    expect(screen.queryByText('Old description')).toBeNull()
  })

  it('keeps decorative media free of visible descriptions', () => {
    expect(getMediaDescription(media({ alt: 'Must stay hidden', decorative: true }))).toBeNull()
  })
})

describe('locale-specific media reads', () => {
  it('requests Media with fallback disabled so a cleared locale stays cleared', async () => {
    const populated = { image: media({ alt: 'Stale fallback description' }) }
    const find = vi.fn().mockResolvedValue({ docs: [media({ alt: null })] })

    await applyExactMediaText({ find } as unknown as Payload, populated, 'fr')

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ locale: 'fr', fallbackLocale: false }),
    )
    expect(populated.image.alt).toBeNull()
  })

  it.each([
    ['fr', 'Description française'],
    ['ar', 'وصف عربي'],
    ['en', 'English description'],
  ] as const)('keeps the %s description independent', async (locale, description) => {
    const populated = { image: media({ alt: 'Fallback value' }) }
    const find = vi.fn().mockImplementation(({ locale: requestedLocale }) => ({
      docs: [media({ alt: requestedLocale === locale ? description : null })],
    }))

    await applyExactMediaText({ find } as unknown as Payload, populated, locale)

    expect(populated.image.alt).toBe(description)
  })
})
