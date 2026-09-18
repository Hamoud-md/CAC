import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { isLocale, type Locale } from '@/lib/locales'

// Rendered on demand so published edits appear immediately (context.md §11.4).
export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ locale: string; slug?: string }> }

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale: rawLocale, slug = '' } = await paramsPromise
  if (!isLocale(rawLocale)) notFound()
  const locale = rawLocale as Locale
  const decodedSlug = decodeURIComponent(slug)
  const url = `/${locale}/${decodedSlug}`

  const page = await queryPageBySlug({ slug: decodedSlug, locale })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout, title } = page
  const showTitle = !hero || hero.type === 'none' || !hero.type

  return (
    <article className="flex flex-col gap-10 py-2">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      {showTitle ? (
        <header className="relative overflow-hidden rounded-xl px-6 py-10 text-white sm:px-9 sm:py-12">
          <div className="absolute inset-0 -z-10 bg-[var(--mbi-purple-dark)]" />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                'linear-gradient(110deg, var(--mbi-purple-dark) 10%, color-mix(in srgb, var(--mbi-purple-deep) 70%, transparent) 100%)',
            }}
          />
          <h1 className="text-[clamp(1.7rem,4.5vw,2.6rem)] font-bold leading-[1.12] text-white">
            {title}
          </h1>
        </header>
      ) : (
        <RenderHero {...hero} />
      )}
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale: rawLocale, slug = '' } = await paramsPromise
  const locale = (isLocale(rawLocale) ? rawLocale : 'fr') as Locale
  const page = await queryPageBySlug({ slug: decodeURIComponent(slug), locale })
  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    locale,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})
