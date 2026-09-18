import React from 'react'

import { adHref, adOpensNewTab, selectAds, type PageContext } from '@/lib/ads'
import type { Locale } from '@/lib/locales'
import type { Advertisement, Media } from '@/payload-types'
import { AdCreativeCarousel } from './AdCreativeCarousel'

function resolvedMedia(value: Advertisement['desktopImage'] | Advertisement['mobileImage']): Media[] {
  const items = Array.isArray(value) ? value : [value]
  return items.filter((item): item is Media => typeof item === 'object' && item !== null)
}

function InFlowCard({ ad, locale }: { ad: Advertisement; locale: Locale }) {
  const mobileMedia = resolvedMedia(ad.mobileImage)
  const media = mobileMedia.length > 0 ? mobileMedia : resolvedMedia(ad.desktopImage)
  if (media.length === 0) return null
  return <AdCreativeCarousel alt={ad.alt ?? undefined} href={adHref(ad, locale)} media={media} newTab={adOpensNewTab(ad)} />
}

/** In-flow ad slot for narrow screens. */
export async function AdInFlow({ locale, pageContext, slot = 0 }: { locale: Locale; pageContext: PageContext; slot?: number }) {
  const ads = await selectAds(pageContext, locale)
  const ad = ads[slot]
  if (!ad) return null
  return <div className="lg:hidden my-2"><InFlowCard ad={ad} locale={locale} /></div>
}
