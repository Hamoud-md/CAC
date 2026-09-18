'use client'

import { cn } from '@/utilities/ui'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { onClick, onVideoEnded, resource, videoClassName, videoControls = false, videoLoop } = props
  const displayHeight = typeof resource === 'object' && resource ? resource.displayHeight : null

  if (resource && typeof resource === 'object') {
    const { filename } = resource
    if (!filename) return null
    const src = getMediaUrl(`/media/${filename}`)

    return (
      <video
        autoPlay
        key={src}
        className={cn(videoClassName)}
        controls={videoControls}
        loop={videoLoop ?? !videoControls}
        muted
        onClick={onClick}
        onEnded={onVideoEnded}
        playsInline
        src={src}
        style={{
          height: 'auto',
          maxHeight: displayHeight ? `min(80vh, ${displayHeight}px)` : '80vh',
          maxWidth: '100%',
        }}
      />
    )
  }

  return null
}
