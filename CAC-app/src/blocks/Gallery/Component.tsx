import React from 'react'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'

export const GalleryBlock: React.FC<Partial<GalleryBlockProps>> = ({ images }) => {
  if (!images?.length) return null
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((item, i) => (
        <figure key={item.id ?? i} className="m-0">
          <Media
            resource={item.image}
            imgClassName="rounded-lg border border-[var(--mbi-border)] w-full h-full object-cover"
          />
          {item.caption && (
            <figcaption className="mt-2 text-sm text-[var(--mbi-text-muted)]">
              {item.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}
