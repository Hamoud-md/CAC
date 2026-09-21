import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Media as MediaType } from '@/payload-types'

vi.mock('@/components/Media', () => ({
  Media: ({ resource, onVideoEnded }: { resource: MediaType; onVideoEnded?: () => void }) =>
    resource.mimeType?.startsWith('video/') ? (
      <video data-testid={`content-media-${resource.id}`} onEnded={onVideoEnded} />
    ) : (
      <div data-testid={`content-media-${resource.id}`} />
    ),
}))

import { ContentMediaCarousel } from '@/components/site/ContentMediaCarousel'

const image = { id: 1, mimeType: 'image/jpeg' } as MediaType
const video = { id: 2, mimeType: 'video/mp4' } as MediaType

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('project and service media carousel', () => {
  it('renders an image-only gallery without scheduling a blank transition', () => {
    vi.useFakeTimers()
    render(<ContentMediaCarousel media={[image]} />)
    act(() => vi.advanceTimersByTime(15000))
    expect(screen.getByTestId('content-media-1')).toBeTruthy()
  })

  it('keeps a single video selected after it ends', () => {
    vi.useFakeTimers()
    render(<ContentMediaCarousel media={[video]} />)
    fireEvent.ended(screen.getByTestId('content-media-2'))
    act(() => vi.advanceTimersByTime(15000))
    expect(screen.getByTestId('content-media-2')).toBeTruthy()
  })

  it('uses the image interval, then keeps the video active until it ends', () => {
    vi.useFakeTimers()
    render(<ContentMediaCarousel media={[image, video]} />)
    expect(screen.getByTestId('content-media-1')).toBeTruthy()
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByTestId('content-media-2')).toBeTruthy()
    act(() => vi.advanceTimersByTime(15000))
    expect(screen.getByTestId('content-media-2')).toBeTruthy()
    fireEvent.ended(screen.getByTestId('content-media-2'))
    expect(screen.getByTestId('content-media-1')).toBeTruthy()
  })

  it('advances through two videos on ended events without a timer blank state', () => {
    vi.useFakeTimers()
    render(<ContentMediaCarousel media={[video, { ...video, id: 3 }]} />)
    expect(screen.getByTestId('content-media-2')).toBeTruthy()
    fireEvent.ended(screen.getByTestId('content-media-2'))
    expect(screen.getByTestId('content-media-3')).toBeTruthy()
    fireEvent.ended(screen.getByTestId('content-media-3'))
    expect(screen.getByTestId('content-media-2')).toBeTruthy()
  })
})
