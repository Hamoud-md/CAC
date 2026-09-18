'use client'

import { useEffect, useState } from 'react'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'

const ROTATION_INTERVAL_MS = 5000

/** A simple, automatic gallery for the images and videos attached to a page. */
export function ContentMediaCarousel({ media }: { media: MediaType[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeMedia = media[activeIndex % media.length]
  const activeIsVideo = activeMedia?.mimeType?.startsWith('video/')

  useEffect(() => {
    if (media.length < 2 || activeIsVideo) return
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % media.length),
      ROTATION_INTERVAL_MS,
    )
    return () => window.clearInterval(timer)
  }, [activeIsVideo, media.length])

  if (!activeMedia) return null

  return (
    <section aria-label="Galerie média" className="overflow-hidden rounded-2xl border border-[var(--mbi-border)]">
      <Media
        resource={activeMedia}
        imgClassName="h-auto w-full"
        videoClassName="h-auto w-full"
        videoControls={activeIsVideo}
        onVideoEnded={() => media.length > 1 && setActiveIndex((current) => (current + 1) % media.length)}
        priority={activeIndex === 0}
      />
      {media.length > 1 && (
        <div className="flex justify-center gap-1.5 p-3" aria-label="Indicateur de média">
          {media.map((item, index) => (
            <span
              key={item.id}
              aria-hidden
              className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-5 bg-[var(--mbi-purple)]' : 'w-1.5 bg-[var(--mbi-border)]'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
