import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

const span: Record<string, string> = {
  full: 'md:col-span-12',
  half: 'md:col-span-6',
  oneThird: 'md:col-span-4',
  twoThirds: 'md:col-span-8',
}

export const ContentBlock: React.FC<ContentBlockProps> = ({ columns }) => {
  if (!columns?.length) return null
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-12">
      {columns.map((col, index) => {
        const { enableLink, link, richText, size } = col
        return (
          <div className={cn('col-span-1', span[size ?? 'full'])} key={index}>
            {richText && <RichText data={richText} enableGutter={false} enableProse />}
            {enableLink && (
              <CMSLink {...link} appearance="inline" className="mbi-focus mt-4 inline-flex font-semibold text-[var(--mbi-purple)]" />
            )}
          </div>
        )
      })}
    </div>
  )
}
