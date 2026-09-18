import { cn } from '@/utilities/ui'
import React from 'react'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  className?: string
  imgClassName?: string
}

const ratioClass: Record<string, string> = {
  '21:9': 'aspect-[21/9]',
  '16:9': 'aspect-[16/9]',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
  '3:4': 'aspect-[3/4]',
}

export const MediaBlock: React.FC<Props> = ({ media, ratio, caption, className, imgClassName }) => {
  if (!media) return null
  const fixed = ratio && ratio !== 'auto' ? ratioClass[ratio] : null
  const resource = typeof media === 'object' ? media : null
  const description = resource && !resource.decorative ? resource.alt : null

  return (
    <figure
      className={cn('m-0 mx-auto w-full', className)}
      style={{ maxWidth: resource?.displayWidth || resource?.width || undefined }}
    >
      {fixed ? (
        <div
          className={cn(
            'relative overflow-hidden rounded-[var(--mbi-radius)] border border-[var(--mbi-border)] bg-[var(--mbi-surface-muted)]',
            fixed,
          )}
        >
          <Media resource={media} fill imgClassName={cn('object-cover', imgClassName)} />
        </div>
      ) : (
        <Media
          resource={media}
          showDescription={false}
          imgClassName={cn(
            'w-full h-auto rounded-[var(--mbi-radius)] border border-[var(--mbi-border)]',
            imgClassName,
          )}
        />
      )}
      {(description || caption) && (
        <figcaption className="mt-2 text-sm text-[var(--mbi-text-muted)]">
          {description}
          {caption && caption !== description && <p className="mt-1 mb-0">{caption}</p>}
        </figcaption>
      )}
    </figure>
  )
}
