import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Media as MediaType } from '@/payload-types'

vi.mock('@/components/Media', () => ({
  Media: ({ resource, onVideoEnded }: { resource: MediaType; onVideoEnded?: () => void }) =>
    resource.mimeType?.startsWith('video/') ? (
      <video data-testid={`media-${resource.id}`} onEnded={onVideoEnded} />
    ) : (
      <div data-testid={`media-${resource.id}`} />
    ),
}))

import { AdCreativeCarousel } from '@/components/Ads/AdCreativeCarousel'

const image = { id: 1, mimeType: 'image/jpeg' } as MediaType
const video = { id: 2, mimeType: 'video/mp4' } as MediaType
const props = { alt: 'creative', href: null, newTab: false }

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('advertisement carousel', () => {
  it('waits for a video to end instead of rotating it on the image timer', () => {
    vi.useFakeTimers()
    render(<AdCreativeCarousel {...props} media={[video, image]} />)
    expect(screen.getByTestId('media-2')).toBeTruthy()
    act(() => vi.advanceTimersByTime(15000))
    expect(screen.getByTestId('media-2')).toBeTruthy()
    fireEvent.ended(screen.getByTestId('media-2'))
    expect(screen.getByTestId('media-1')).toBeTruthy()
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByTestId('media-2')).toBeTruthy()
  })

  it('keeps a single video selected', () => {
    vi.useFakeTimers()
    render(<AdCreativeCarousel {...props} media={[video]} />)
    fireEvent.ended(screen.getByTestId('media-2'))
    act(() => vi.advanceTimersByTime(15000))
    expect(screen.getByTestId('media-2')).toBeTruthy()
  })

  it('clears the image timer when a new video becomes selected', () => {
    vi.useFakeTimers()
    const view = render(<AdCreativeCarousel {...props} media={[image, video]} />)
    act(() => vi.advanceTimersByTime(2500))
    view.rerender(<AdCreativeCarousel {...props} media={[video, image]} />)
    act(() => vi.advanceTimersByTime(10000))
    expect(screen.getByTestId('media-2')).toBeTruthy()
  })

  it('keeps image-only advertisements on the five-second interval', () => {
    vi.useFakeTimers()
    render(<AdCreativeCarousel {...props} media={[image, { ...image, id: 3 }]} />)
    act(() => vi.advanceTimersByTime(4999))
    expect(screen.getByTestId('media-1')).toBeTruthy()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.getByTestId('media-3')).toBeTruthy()
  })
})
