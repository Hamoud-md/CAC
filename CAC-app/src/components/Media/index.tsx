import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'
import { getMediaDescription } from '@/utilities/mediaDescription'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource, showDescription = true, fill } = props
  const description = typeof resource === 'object' ? getMediaDescription(resource) : null
  const displayWidth = typeof resource === 'object' && resource ? resource.displayWidth : null

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
            style:
              !fill && displayWidth
                ? { maxWidth: `${displayWidth}px`, width: '100%', marginInline: 'auto' }
                : undefined,
          }
        : {})}
    >
      {isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />}
      {!fill && showDescription && description && (
        <p className="mt-2 mb-0 text-sm text-[var(--mbi-text-muted)]">{description}</p>
      )}
    </Tag>
  )
}
