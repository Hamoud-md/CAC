import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { Media } from '@/components/Media'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ContentMediaCarousel } from '@/components/site/ContentMediaCarousel'
import type { Media as MediaType } from '@/payload-types'
import { ServicePageTemplate } from '@/components/site/ServicePageTemplate'
import { getServiceBySlug, getSiteSettings } from '@/lib/data'
import { isLocale, type Locale } from '@/lib/locales'
import { generateMeta } from '@/utilities/generateMeta'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ locale: string; category: string; service: string }> }

export default async function ServicePage({ params }: Args) {
  const { locale: raw, category, service } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const catSlug = decodeURIComponent(category)
  const svcSlug = decodeURIComponent(service)

  const [doc, settings] = await Promise.all([
    getServiceBySlug(catSlug, svcSlug, locale),
    getSiteSettings(locale),
  ])
  if (!doc) return <PayloadRedirects url={`/${locale}/services/${catSlug}/${svcSlug}`} />

  const cat = typeof doc.category === 'object' ? doc.category : null
  const cover = doc.coverImage && typeof doc.coverImage === 'object' ? doc.coverImage : null
  const mediaGallery = Array.isArray(doc.mediaGallery)
    ? doc.mediaGallery.filter((item): item is MediaType => typeof item === 'object' && item !== null)
    : []

  return (
    <ServicePageTemplate
      doc={doc}
      locale={locale}
      eyebrow={cat?.title ?? null}
      backHref={cat ? `/${locale}/services/${cat.slug}` : `/${locale}/#services`}
      backLabel={cat?.title ?? undefined}
      ctaDefault={settings?.serviceCtaDefault ?? null}
    >
      {cover && (
        <div className="mbi-card overflow-hidden">
          <Media resource={cover} imgClassName="w-full object-cover" priority />
        </div>
      )}
      {mediaGallery.length > 0 && <ContentMediaCarousel media={mediaGallery} />}
    </ServicePageTemplate>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale: raw, category, service } = await params
  const locale = (isLocale(raw) ? raw : 'fr') as Locale
  const doc = await getServiceBySlug(decodeURIComponent(category), decodeURIComponent(service), locale)
  return generateMeta({ doc: doc ?? null })
}
