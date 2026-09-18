import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl text-white">
      <div className="absolute inset-0 -z-10 bg-[var(--mbi-purple-dark)]" />
      {media && typeof media === 'object' && (
        <>
          <Media fill imgClassName="object-cover -z-10 opacity-40" priority resource={media} />
        </>
      )}
      <div className="relative px-7 py-14 md:px-12 md:py-20 max-w-[40rem]">
        {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => (
              <li key={i}>
                <CMSLink {...link} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
