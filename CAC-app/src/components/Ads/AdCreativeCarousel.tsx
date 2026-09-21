'use client'

import { useEffect, useState } from 'react'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'

const ROTATION_INTERVAL_MS = 5000

type Props = { alt?: string; href: string | null; media: MediaType[]; newTab: boolean }

/** Displays each creative at its natural ratio, then advances automatically. */
export function AdCreativeCarousel({ alt, href, media, newTab }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeMedia = media[activeIndex % media.length]
  const activeIsVideo = activeMedia?.mimeType?.startsWith('video/')

  useEffect(() => {
    if (media.length < 2 || activeIsVideo) return
    const timer = window.setTimeout(
      () => setActiveIndex((current) => (current + 1) % media.length),
      ROTATION_INTERVAL_MS,
    )
    return () => window.clearTimeout(timer)
  }, [activeIndex, activeIsVideo, media.length])

  if (!activeMedia) return null
  const creative = (
    <Media
      key={activeMedia.id}
      resource={activeMedia}
      alt={alt}
      showDescription={false}
      imgClassName="h-auto w-full rounded-[var(--mbi-radius)] border border-[var(--mbi-border)]"
      videoClassName="h-auto w-full rounded-[var(--mbi-radius)] border border-[var(--mbi-border)]"
      videoLoop={media.length === 1}
      onVideoEnded={() =>
        media.length > 1 && setActiveIndex((current) => (current + 1) % media.length)
      }
    />
  )

  if (!href) return <div>{creative}</div>
  return (
    <a
      href={href}
      aria-label={alt}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="mbi-focus block rounded-[var(--mbi-radius)]"
    >
      {creative}
    </a>
  )
}
