import React from 'react'

import { adHref, adOpensNewTab, selectAds, type PageContext } from '@/lib/ads'
import { getSiteSettings } from '@/lib/data'
import { ui, type Locale } from '@/lib/locales'
import type { Advertisement, Media } from '@/payload-types'
import { AdCreativeCarousel } from './AdCreativeCarousel'

function resolvedMedia(value: Advertisement['desktopImage']): Media[] {
  const items = Array.isArray(value) ? value : [value]
  return items.filter((item): item is Media => typeof item === 'object' && item !== null)
}

function AdCard({ ad, locale }: { ad: Advertisement; locale: Locale }) {
  const media = resolvedMedia(ad.desktopImage)
  if (media.length === 0) return null
  return <AdCreativeCarousel alt={ad.alt ?? undefined} href={adHref(ad, locale)} media={media} newTab={adOpensNewTab(ad)} />
}

/** Desktop advertising rail. */
export async function AdRail({ locale, pageContext }: { locale: Locale; pageContext: PageContext }) {
  const [ads, settings] = await Promise.all([selectAds(pageContext, locale), getSiteSettings(locale)])
  const labelText = settings?.adLabel ?? ui[locale].advertisement
  const label = labelText ? <p className="mb-3 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-[var(--mbi-text-muted)]">{labelText}</p> : null

  if (ads.length === 0) return <div>{label}<div className="h-[220px] rounded-[var(--mbi-radius)] border border-dashed border-[var(--mbi-border)] bg-[var(--mbi-surface-muted)]" /></div>

  return <div className="flex flex-col">{label}<div className="flex flex-col gap-5">{ads.map((ad) => <AdCard key={ad.id} ad={ad} locale={locale} />)}</div></div>
}
