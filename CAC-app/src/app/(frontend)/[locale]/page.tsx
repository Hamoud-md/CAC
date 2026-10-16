import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { getFeaturedProjects, getHomepage, getNav, getSiteSettings } from '@/lib/data'
import { isLocale, ui, type Locale } from '@/lib/locales'
import { notFound } from 'next/navigation'
import { Media } from '@/components/Media'
import { AdInFlow } from '@/components/Ads/AdInFlow'
import Image from 'next/image'
import { CAC_NAME } from '@/components/site/brand'
import { ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ locale: string }> }

export default async function HomePage({ params }: Args) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const t = ui[locale]

  const [home, categories, projects] = await Promise.all([
    getHomepage(locale),
    getNav(locale),
    getFeaturedProjects(locale),
  ])

  const heroImg = home?.heroImage && typeof home.heroImage === 'object' ? home.heroImage : null
  const overlayOn = home?.heroOverlayEnabled !== false
  const overlayPct = typeof home?.heroOverlay === 'number' ? home.heroOverlay : 66
  const overlayBase =
    home?.heroOverlayColor === 'black'
      ? '#111111'
      : home?.heroOverlayColor === 'navy'
        ? '#141c3a'
        : 'var(--mbi-purple-dark)'
  const veil = !overlayOn
    ? 'transparent'
    : heroImg
      ? `linear-gradient(105deg, ${overlayBase} 0%, color-mix(in srgb, ${overlayBase} ${overlayPct}%, transparent) 55%, color-mix(in srgb, ${overlayBase} ${Math.max(
          overlayPct - 35,
          0,
        )}%, transparent) 100%)`
      : `linear-gradient(120deg, ${overlayBase} 0%, color-mix(in srgb, ${overlayBase} 82%, #60083b) 60%, ${overlayBase} 100%)`

  const ctaHref = home?.heroCtaHref ?? '#services'
  const servicesEyebrow = home?.servicesEyebrow || t.ourServices
  const projectsEyebrow = home?.projectsEyebrow || t.featuredProjects

  return (
    <div className="flex flex-col gap-16 py-2 md:gap-20">
      {/* Hero */}
      <section className="cac-hero">
        <div className="cac-hero-image">
          {heroImg && (
            <div className="absolute inset-0">
              <Media resource={heroImg} fill imgClassName="object-cover" priority />
            </div>
          )}
          {!heroImg && (
            <Image
              src="/images/hero.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
            />
          )}
          <div className="cac-hero-veil" style={{ background: veil }} />
          <span className="cac-hero-signature" aria-hidden="true">
            CAC / 01
          </span>
        </div>
        <div className="cac-hero-copy">
          <p className="mbi-eyebrow">Contemporary Artistic Construction</p>
          {home?.heroEyebrow && (
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[var(--mbi-purple)]">
              {home.heroEyebrow}
            </p>
          )}
          <h1 className="cac-hero-title">{home?.heroHeading ?? 'CAC'}</h1>
          {home?.heroParagraph && (
            <p className="mt-5 max-w-[30rem] text-[0.9375rem] leading-relaxed text-[var(--mbi-text-soft)] sm:text-base">
              {home.heroParagraph}
            </p>
          )}
          <Link
            href={ctaHref.startsWith('#') ? ctaHref : `/${locale}${ctaHref}`}
            className="mbi-btn mbi-btn-primary mbi-focus mt-8"
          >
            {home?.heroCtaLabel ?? t.discoverServices}
            <span aria-hidden className="inline-block rtl:rotate-180">
              →
            </span>
          </Link>
        </div>
      </section>

      <AdInFlow locale={locale} pageContext={{ type: 'homepage' }} slot={0} />

      {/* Services overview — the categories */}
      {categories.length > 0 && (
        <section id="services" className="scroll-mt-[calc(var(--mbi-sticky-offset)+1rem)]">
          <p className="mbi-eyebrow">{servicesEyebrow}</p>
          {home?.servicesHeading && (
            <h2 className="mt-2 text-[clamp(1.45rem,3.5vw,2rem)] font-bold">
              {home.servicesHeading}
            </h2>
          )}
          {home?.servicesIntro && (
            <p className="mt-3 max-w-[44rem] text-[var(--mbi-text-soft)]">{home.servicesIntro}</p>
          )}
          <ul className="cac-service-list mt-8">
            {categories.map((c, index) => (
              <li key={c.id}>
                <Link
                  href={`/${locale}/services/${c.slug}`}
                  className="cac-service-card mbi-focus group"
                >
                  <span className="cac-service-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-semibold leading-snug">{c.title}</p>
                    {c.summary && (
                      <p className="mt-1.5 line-clamp-2 text-sm text-[var(--mbi-text-muted)]">
                        {c.summary}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--mbi-purple)]">
                    {c.services.length > 0
                      ? `${c.services.length} ${locale === 'ar' ? 'خدمات' : locale === 'en' ? 'services' : 'services'}`
                      : locale === 'ar'
                        ? 'اكتشف'
                        : locale === 'en'
                          ? 'Discover'
                          : 'Découvrir'}
                    <ChevronRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AdInFlow locale={locale} pageContext={{ type: 'homepage' }} slot={1} />

      {/* Featured projects */}
      {projects.length > 0 && (
        <section>
          <p className="mbi-eyebrow">{projectsEyebrow}</p>
          {home?.projectsHeading && (
            <h2 className="mt-2 text-[clamp(1.45rem,3.5vw,2rem)] font-bold">
              {home.projectsHeading}
            </h2>
          )}
          {home?.projectsIntro && (
            <p className="mt-3 max-w-[44rem] text-[var(--mbi-text-soft)]">{home.projectsIntro}</p>
          )}
          <ul className="cac-project-grid mt-8">
            {projects.map((p) => {
              const cover = p.coverImage && typeof p.coverImage === 'object' ? p.coverImage : null
              return (
                <li key={p.id}>
                  <Link
                    href={`/${locale}/projets/${p.slug}`}
                    className="cac-project-card mbi-focus group block overflow-hidden"
                  >
                    {cover && (
                      <div className="aspect-[16/10] overflow-hidden bg-[var(--mbi-surface-muted)]">
                        <Media
                          resource={cover}
                          imgClassName="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      {p.category && <p className="mbi-eyebrow text-[0.6875rem]">{p.category}</p>}
                      <p className="mt-1 font-semibold text-[var(--mbi-text)]">{p.title}</p>
                      {p.summary && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-[var(--mbi-text-muted)]">
                          {p.summary}
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
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale: raw } = await params
  const locale = (isLocale(raw) ? raw : 'fr') as Locale
  const [home, settings] = await Promise.all([getHomepage(locale), getSiteSettings(locale)])
  return {
    title: settings?.defaultMetaTitle ?? settings?.siteName ?? CAC_NAME,
    description: settings?.defaultMetaDescription ?? home?.heroParagraph ?? undefined,
  }
}
