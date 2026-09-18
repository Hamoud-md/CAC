import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { Media } from '@/components/Media'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ContentMediaCarousel } from '@/components/site/ContentMediaCarousel'
import type { Media as MediaType } from '@/payload-types'
import { ServicePageTemplate } from '@/components/site/ServicePageTemplate'
import { getCategoryBySlug, getSiteSettings } from '@/lib/data'
import { isLocale, ui, type Locale } from '@/lib/locales'
import { generateMeta } from '@/utilities/generateMeta'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ locale: string; category: string }> }

export default async function CategoryPage({ params }: Args) {
  const { locale: raw, category: rawSlug } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const slug = decodeURIComponent(rawSlug)
  const [data, settings] = await Promise.all([
    getCategoryBySlug(slug, locale),
    getSiteSettings(locale),
  ])
  if (!data) return <PayloadRedirects url={`/${locale}/services/${slug}`} />

  const { category, services } = data
  const t = ui[locale]
  const mediaGallery = Array.isArray(category.mediaGallery)
    ? category.mediaGallery.filter((item): item is MediaType => typeof item === 'object' && item !== null)
    : []

  return (
    <ServicePageTemplate
      doc={category}
      locale={locale}
      backHref={`/${locale}/#services`}
      backLabel={t.ourServices}
      ctaDefault={settings?.serviceCtaDefault ?? null}
    >
      {mediaGallery.length > 0 && <ContentMediaCarousel media={mediaGallery} />}
      {services.length > 0 && (
        <section>
          <ul className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => {
              const cover = s.coverImage && typeof s.coverImage === 'object' ? s.coverImage : null
              return (
                <li key={s.id}>
                  <Link
                    href={`/${locale}/services/${slug}/${s.slug}`}
                    className="mbi-card mbi-focus group block h-full overflow-hidden transition-colors hover:border-[var(--mbi-purple)]"
                  >
                    {cover && (
                      <div className="aspect-[16/10] overflow-hidden bg-[var(--mbi-surface-muted)]">
                        <Media
                          resource={cover}
                          imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <p className="font-semibold text-[var(--mbi-text)]">{s.title}</p>
                      {s.summary && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-[var(--mbi-text-muted)]">
                          {s.summary}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </ServicePageTemplate>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale: raw, category } = await params
  const locale = (isLocale(raw) ? raw : 'fr') as Locale
  const data = await getCategoryBySlug(decodeURIComponent(category), locale)
  return generateMeta({ doc: data?.category ?? null })
}
