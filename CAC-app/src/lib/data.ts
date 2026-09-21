import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Locale } from './locales'
import { applyExactMediaText } from '@/utilities/applyExactMediaText'
import { MEDIA_CONTENT_TAG } from '@/utilities/cacheTags'

/**
 * Public data-loading contracts. Every read is cached and tagged so a Payload
 * afterChange hook can revalidate exactly what changed (context.md §11.4, §17).
 */

const payloadClient = async () => getPayload({ config: configPromise })

export const getSiteSettings = (locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await payloadClient()
      const settings = await payload.findGlobal({ slug: 'site-settings', locale, depth: 1 })
      return applyExactMediaText(payload, settings, locale)
    },
    ['site-settings', locale],
    { tags: ['site-settings', MEDIA_CONTENT_TAG] },
  )()

export const getHomepage = (locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await payloadClient()
      const homepage = await payload.findGlobal({ slug: 'homepage', locale, depth: 1 })
      return applyExactMediaText(payload, homepage, locale)
    },
    ['homepage', locale],
    { tags: ['homepage', MEDIA_CONTENT_TAG] },
  )()

export const getNavPages = (locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await payloadClient()
      const res = await payload.find({
        collection: 'pages',
        locale,
        where: { _status: { equals: 'published' }, showInNav: { equals: true } },
        sort: 'navOrder',
        depth: 0,
        limit: 50,
        pagination: false,
        select: { title: true, slug: true, navOrder: true },
      })
      return res.docs
    },
    ['nav-pages', locale],
    { tags: ['pages'] },
  )()

export type NavSubService = {
  id: number | string
  title: string
  slug: string
  summary?: string | null
}
export type NavCategory = {
  id: number | string
  title: string
  slug: string
  summary?: string | null
  hasPage: boolean // true when there are no sub-services → the tab links to its own page
  services: NavSubService[]
}

/** Full nav tree: published categories (showInNav) with their published sub-services. */
export const getNav = (locale: Locale) =>
  unstable_cache(
    async (): Promise<NavCategory[]> => {
      const payload = await payloadClient()
      const [cats, subs] = await Promise.all([
        payload.find({
          collection: 'service-categories',
          locale,
          where: { _status: { equals: 'published' }, showInNav: { equals: true } },
          sort: '_order',
          depth: 0,
          limit: 100,
          pagination: false,
          select: { title: true, slug: true, summary: true },
        }),
        payload.find({
          collection: 'services',
          locale,
          where: { _status: { equals: 'published' } },
          sort: '_order',
          depth: 0,
          limit: 500,
          pagination: false,
          select: { title: true, slug: true, summary: true, category: true },
        }),
      ])

      return cats.docs.map((c) => {
        const services = subs.docs
          .filter((s) => {
            const cat = s.category
            const catId = typeof cat === 'object' && cat ? cat.id : cat
            return catId === c.id
          })
          .map((s) => ({
            id: s.id,
            title: s.title ?? '',
            slug: String(s.slug ?? ''),
            summary: s.summary ?? null,
          }))
        return {
          id: c.id,
          title: c.title ?? '',
          slug: String(c.slug ?? ''),
          summary: c.summary ?? null,
          hasPage: services.length === 0,
          services,
        }
      })
    },
    ['nav', locale],
    { tags: ['service-categories', 'services'] },
  )()

export const getCategoryBySlug = (slug: string, locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await payloadClient()
      const catRes = await payload.find({
        collection: 'service-categories',
        locale,
        where: { slug: { equals: slug }, _status: { equals: 'published' } },
        depth: 2,
        limit: 1,
        pagination: false,
      })
      const category = catRes.docs[0]
      if (!category) return null
      const subRes = await payload.find({
        collection: 'services',
        locale,
        where: { _status: { equals: 'published' }, category: { equals: category.id } },
        sort: '_order',
        depth: 1,
        limit: 200,
        pagination: false,
      })
      return applyExactMediaText(payload, { category, services: subRes.docs }, locale)
    },
    ['category', slug, locale],
    { tags: ['service-categories', 'services', `category:${slug}`, MEDIA_CONTENT_TAG] },
  )()

export const getServiceBySlug = (categorySlug: string, serviceSlug: string, locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await payloadClient()
      const res = await payload.find({
        collection: 'services',
        locale,
        where: { slug: { equals: serviceSlug }, _status: { equals: 'published' } },
        depth: 2,
        limit: 5,
        pagination: false,
      })
      // Disambiguate by parent category slug (two services could share a slug across categories).
      const service =
        res.docs.find((s) => {
          const cat = s.category
          return typeof cat === 'object' && cat && String(cat.slug) === categorySlug
        }) ??
        res.docs[0] ??
        null
      return service ? applyExactMediaText(payload, service, locale) : null
    },
    ['service', categorySlug, serviceSlug, locale],
    { tags: ['services', `service:${serviceSlug}`, MEDIA_CONTENT_TAG] },
  )()

export const getProjects = (locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await payloadClient()
      const res = await payload.find({
        collection: 'projects',
        locale,
        where: { _status: { equals: 'published' } },
        sort: '_order',
        depth: 1,
        limit: 200,
        pagination: false,
      })
      return applyExactMediaText(payload, res.docs, locale)
    },
    ['projects-list', locale],
    { tags: ['projects', MEDIA_CONTENT_TAG] },
  )()

export const getProjectBySlug = (slug: string, locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await payloadClient()
      const res = await payload.find({
        collection: 'projects',
        locale,
        where: { slug: { equals: slug }, _status: { equals: 'published' } },
        depth: 2,
        limit: 1,
        pagination: false,
      })
      const project = res.docs[0]
      return project ? applyExactMediaText(payload, project, locale) : null
    },
    ['project', slug, locale],
    { tags: ['projects', `project:${slug}`, MEDIA_CONTENT_TAG] },
  )()

export const getFeaturedProjects = (locale: Locale) =>
  unstable_cache(
    async () => {
      const payload = await payloadClient()
      const res = await payload.find({
        collection: 'projects',
        locale,
        where: { _status: { equals: 'published' }, featured: { equals: true } },
        sort: '_order',
        depth: 1,
        limit: 6,
        pagination: false,
      })
      return applyExactMediaText(payload, res.docs, locale)
    },
    ['featured-projects', locale],
    { tags: ['projects', MEDIA_CONTENT_TAG] },
  )()
