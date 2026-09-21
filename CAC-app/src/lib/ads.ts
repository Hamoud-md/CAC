import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Advertisement } from '@/payload-types'
import type { Locale } from './locales'
import { applyExactMediaText } from '@/utilities/applyExactMediaText'
import { MEDIA_CONTENT_TAG } from '@/utilities/cacheTags'

export type PageContext =
  | { type: 'all' }
  | { type: 'homepage' }
  | { type: 'service'; slug: string }
  | { type: 'project'; slug: string }
  | { type: 'page'; slug: string }

/** Raw active ads, cached and tag-revalidated on any ad change. */
const getActiveAds = (locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })
      const res = await payload.find({
        collection: 'advertisements',
        locale,
        where: { active: { equals: true } },
        sort: '_order',
        depth: 1,
        limit: 200,
        pagination: false,
      })
      return applyExactMediaText(payload, res.docs, locale)
    },
    ['active-ads', locale],
    { tags: ['ads', MEDIA_CONTENT_TAG] },
  )()

const relSlugs = (v: unknown): string[] => {
  if (!Array.isArray(v)) return []
  return v
    .map((x) => (typeof x === 'object' && x ? (x as { slug?: string }).slug : undefined))
    .filter((s): s is string => typeof s === 'string')
}

function matchesContext(ad: Advertisement, ctx: PageContext): boolean {
  const scope = ad.targeting?.scope ?? 'all'
  if (scope === 'all') return true
  if (scope === 'homepage') return ctx.type === 'homepage'
  if (scope === 'services')
    return ctx.type === 'service' && relSlugs(ad.targeting?.services).includes(ctx.slug)
  if (scope === 'projects')
    return ctx.type === 'project' && relSlugs(ad.targeting?.projects).includes(ctx.slug)
  if (scope === 'pages')
    return ctx.type === 'page' && relSlugs(ad.targeting?.pages).includes(ctx.slug)
  return false
}

function withinSchedule(ad: Advertisement, now: number): boolean {
  if (ad.startAt && new Date(ad.startAt).getTime() > now) return false
  if (ad.endAt && new Date(ad.endAt).getTime() < now) return false
  return true
}

/**
 * Ads eligible for a page, in display order (context.md §7.3).
 * Evaluation order: schedule window -> targeting -> dashboard order.
 */
export async function selectAds(
  ctx: PageContext,
  locale: Locale,
  now: number = Date.now(),
): Promise<Advertisement[]> {
  const ads = await getActiveAds(locale)
  return ads.filter((ad) => withinSchedule(ad, now) && matchesContext(ad, ctx))
}

export function adHref(ad: Advertisement, locale: Locale): string | null {
  const url = ad.destinationUrl
  if (!url) return null
  return url.startsWith('/') ? `/${locale}${url}` : url
}

export function adIsExternal(ad: Advertisement): boolean {
  return !!ad.destinationUrl && !ad.destinationUrl.startsWith('/')
}

export function adOpensNewTab(ad: Advertisement): boolean {
  if (ad.openIn === 'new') return true
  if (ad.openIn === 'same') return false
  return adIsExternal(ad) // auto
}
