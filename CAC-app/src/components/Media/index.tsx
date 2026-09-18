import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource, showDescription = true, fill } = props
  const description =
    typeof resource === 'object' && resource && !resource.decorative ? resource.alt : null
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
      {!isVideo && !fill && showDescription && description && (
        <p className="mt-2 mb-0 text-sm text-[var(--mbi-text-muted)]">{description}</p>
      )}
    </Tag>
  )
}
