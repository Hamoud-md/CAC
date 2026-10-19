// @vitest-environment node
// Real public components and compiled CSS; CMS boundaries are mocked, never booted.
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'
import { chromium } from '@playwright/test'
import { expect, it, vi } from 'vitest'

vi.mock('next/font/google', () => ({
  DM_Sans: () => ({ variable: '' }), Manrope: () => ({ variable: '' }),
  Noto_Sans_Arabic: () => ({ variable: '' }),
}))
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: false }) }))
vi.mock('next/navigation', () => ({ usePathname: () => '/fr', useRouter: () => ({ push: vi.fn() }), notFound: () => { throw Error('404') } }))
vi.mock('@/lib/pageContext', () => ({ pageContextFromHeaders: async () => ({ type: 'homepage' }) }))
vi.mock('@/components/AdminBar', () => ({ AdminBar: () => null }))
vi.mock('@/providers', () => ({ Providers: ({ children }: { children: React.ReactNode }) => children }))
vi.mock('@/lib/data', () => ({
  getSiteSettings: async () => ({}), getNavPages: async () => [],
  getFeaturedProjects: async () => [],
  getHomepage: async () => ({ heroHeading: 'Construisons votre avenir', heroParagraph: 'Architecture et construction', heroCtaLabel: 'Découvrir nos services' }),
  getNav: async () => [{ id: 1, title: 'Architecture', slug: 'architecture', services: [{ id: 2, title: 'Design', slug: 'design' }] }],
}))
vi.mock('@/lib/ads', () => {
  // Importing the real selector would load Payload config. Supply selected CMS
  // fixtures here; selection and destination handling remain unchanged in production.
  return {
    selectAds: async () => [1, 2].map((id) => ({
      id, alt: `Creative ${id}`, destinationUrl: '/contact',
      desktopImage: [{ id, mimeType: id === 1 ? 'image/png' : 'video/mp4', url: '/creative.png', filename: 'creative.mp4', width: 1200, height: 800 }],
      mobileImage: [{ id: id + 10, mimeType: 'image/png', url: '/mobile.png', width: 600, height: 300 }],
    })),
    adHref: (_ad: unknown, locale: string) => `/${locale}/contact`,
    adOpensNewTab: () => false,
  }
})

import Layout from '@/app/(frontend)/[locale]/layout'
import HomePage from '@/app/(frontend)/[locale]/page'
import { ui, type Locale } from '@/lib/locales'

// Resolve only async server components; React renders the existing client components.
async function resolveServer(node: React.ReactNode): Promise<React.ReactNode> {
  if (Array.isArray(node)) return Promise.all(React.Children.toArray(node).map(resolveServer))
  if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return node
  if (typeof node.type === 'function' && node.type.constructor.name === 'AsyncFunction') {
    return resolveServer(await (node.type as (props: unknown) => Promise<React.ReactNode>)(node.props))
  }
  if (node.props.children !== undefined) {
    return React.cloneElement(node, {}, await resolveServer(node.props.children))
  }
  return node
}

it('keeps the real public sidebar beside content, mirrored in AR, with exclusive mobile slots', async () => {
  const cssPath = path.resolve('src/app/(frontend)/globals.css')
  const css = await postcss([tailwind()]).process(await readFile(cssPath, 'utf8'), { from: cssPath })
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  await mkdir('test-results/ad-sidebar', { recursive: true })
  try {
    const page = await browser.newPage()
    const image = await readFile('scripts/assets/ad-house-1.png')
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() === 'image') {
        await route.fulfill({ contentType: 'image/png', body: image })
      } else await route.abort()
    })
    for (const locale of ['fr', 'en', 'ar'] as Locale[]) {
      const params = Promise.resolve({ locale })
      const home = await resolveServer(await HomePage({ params }))
      const html = renderToStaticMarkup(await resolveServer(await Layout({ params, children: home })))
      for (const width of [320, 390, 768, 1023, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 })
        await page.setContent(html.replace('</head>', `<base href="http://sidebar.test"><style>${css.css}</style></head>`))
        await page.locator('a[aria-label="Creative 1"]:visible img').evaluate((img) => (img as HTMLImageElement).decode())
        const sidebar = page.locator('.cac-ad-sidebar')
        expect(await sidebar.getAttribute('aria-label')).toBe(ui[locale].advertisement)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
        const desktop = width >= 1024
        expect(await sidebar.isVisible()).toBe(desktop)
        expect(await page.locator('main a[aria-label="Creative 1"]').isVisible()).toBe(!desktop)
        expect(await page.locator('a[aria-label="Creative 1"]:visible').count()).toBe(1)
        if (desktop) {
          const main = (await page.locator('main').boundingBox())!
          const rail = (await sidebar.boundingBox())!
          expect(Math.abs(main.y - rail.y)).toBeLessThan(1)
          expect(main.width / rail.width).toBeCloseTo(7 / 3, 1)
          expect(locale === 'ar' ? rail.x + rail.width <= main.x : main.x + main.width <= rail.x).toBe(true)
          expect(await sidebar.locator('video').count()).toBe(1)
          expect(await sidebar.locator('a').first().getAttribute('href')).toBe(`/${locale}/contact`)
        }
        // All visible creative boxes fit their slot without clipping or sideways overflow.
        const fits = await page.locator('a[aria-label^="Creative"]:visible').evaluateAll((links) => links.every((link) => {
          const box = link.getBoundingClientRect()
          return box.width > 0 && box.left >= 0 && box.right <= innerWidth && link.scrollWidth <= box.width + 1
        }))
        expect(fits).toBe(true)
        if (width === 390 || width === 1024 || width === 1440) {
          await page.screenshot({ path: `test-results/ad-sidebar/${locale}-${width}.png`, fullPage: true })
        }
      }
    }
  } finally {
    await browser.close()
  }
}, 120_000)
