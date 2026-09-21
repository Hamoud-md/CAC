import React from 'react'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import { getMediaDescription } from '@/utilities/mediaDescription'

export const GalleryBlock: React.FC<Partial<GalleryBlockProps>> = ({ images }) => {
  if (!images?.length) return null
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((item, i) => {
        const resource = typeof item.image === 'object' ? item.image : null
        const description = getMediaDescription(resource)
        return (
          <figure key={item.id ?? i} className="m-0">
            <Media
              resource={item.image}
              showDescription={false}
              imgClassName="rounded-lg border border-[var(--mbi-border)] w-full h-full object-cover"
            />
            {(description || item.caption) && (
              <figcaption className="mt-2 text-sm text-[var(--mbi-text-muted)]">
                {description}
                {item.caption && item.caption !== description && (
                  <p className="mt-1 mb-0">{item.caption}</p>
                )}
              </figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
