// @vitest-environment node
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { Payload, User } from 'payload'
import { afterAll, beforeAll, expect, it } from 'vitest'

let payload: Payload
let user: User
let media: number
let category: number
let root: string
const locales = ['fr', 'ar', 'en'] as const
const context = { disableRevalidate: true }

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'cac-admin-completion-'))
  // Never inherit DATABASE_URL. Optional Postgres must be an explicitly named
  // disposable database on loopback, not a production server or tunnel.
  const postgres = process.env.CAC_ADMIN_TEST_DATABASE_URL
  if (postgres) {
    const url = new URL(postgres)
    if (url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1' || url.pathname !== '/cac_admin_test') throw new Error('Only the isolated loopback cac_admin_test database is allowed')
  }
  process.env.DATABASE_URL = postgres || `file:${path.join(root, 'test.db')}`
  process.env.PAYLOAD_SECRET = 'cac-isolated-test-secret-at-least-32-characters'
  process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3317'
  const [{ getPayload }, { default: configPromise }] = await Promise.all([import('payload'), import('../../src/payload.config')])
  const config = await configPromise
  const mediaConfig = config.collections.find((entry) => entry.slug === 'media')!
  if (typeof mediaConfig.upload === 'object') mediaConfig.upload.staticDir = path.join(root, 'media')
  payload = await getPayload({ config })
  await payload.create({ collection: 'users', data: { name: 'Isolated audit owner', email: 'owner@cac-test.invalid', password: 'Isolated-test-password-4719!', role: 'admin' } })
  const login = await payload.login({ collection: 'users', data: { email: 'owner@cac-test.invalid', password: 'Isolated-test-password-4719!' } })
  const authenticated = await payload.auth({ headers: new Headers({ Authorization: `JWT ${login.token}` }) })
  expect(authenticated.user?.role).toBe('admin')
  user = authenticated.user as User
}, 180_000)

afterAll(async () => { if (payload) await payload.destroy() })

it('authenticates and saves both globals independently in FR/AR/EN', async () => {
  for (const locale of locales) {
    await payload.updateGlobal({ slug: 'site-settings', locale, overrideAccess: false, user, context, data: { siteName: `CAC ${locale}`, tagline: `Tagline ${locale}` } })
    await payload.updateGlobal({ slug: 'homepage', locale, overrideAccess: false, user, context, data: { heroHeading: `Heading ${locale}`, heroParagraph: `Paragraph ${locale}` } })
  }
  for (const locale of locales) {
    expect((await payload.findGlobal({ slug: 'site-settings', locale, fallbackLocale: false, overrideAccess: false, user })).tagline).toBe(`Tagline ${locale}`)
    expect((await payload.findGlobal({ slug: 'homepage', locale, fallbackLocale: false, overrideAccess: false, user })).heroParagraph).toBe(`Paragraph ${locale}`)
  }
  await expect(payload.updateGlobal({ slug: 'homepage', overrideAccess: false, context, data: { heroHeading: 'Unauthorized' } })).rejects.toThrow()
}, 120_000)

it('uploads isolated media, replaces its file and retains its identity and translations', async () => {
  const image = await import('sharp')
  const original = path.join(root, 'original.png')
  const replacement = path.join(root, 'replacement.png')
  await writeFile(original, await image.default({ create: { width: 4, height: 4, channels: 3, background: 'red' } }).png().toBuffer())
  await writeFile(replacement, await image.default({ create: { width: 8, height: 8, channels: 3, background: 'blue' } }).png().toBuffer())
  const document = await payload.create({ collection: 'media', overrideAccess: false, user, context, locale: 'fr', filePath: original, data: { alt: 'Image fr' } })
  media = document.id
  for (const locale of locales) await payload.update({ collection: 'media', id: media, overrideAccess: false, user, context, locale, data: { alt: `Image ${locale}` } })
  const updated = await payload.update({ collection: 'media', id: media, overrideAccess: false, user, context, filePath: replacement, data: {} })
  expect(updated.id).toBe(media)
  expect(updated.width).toBe(8)
  for (const locale of locales) expect((await payload.findByID({ collection: 'media', id: media, locale, fallbackLocale: false })).alt).toBe(`Image ${locale}`)
}, 120_000)

it('creates, translates, saves drafts, publishes and deletes isolated content while protecting relationships', async () => {
  const base = await payload.create({ collection: 'service-categories', overrideAccess: false, user, context, data: { title: 'Test category', slug: 'audit-category', layout: [], _status: 'published' } })
  category = base.id
  const created: { collection: 'pages' | 'services' | 'projects'; id: number }[] = []
  for (const collection of ['pages', 'services', 'projects'] as const) {
    const document = await payload.create({ collection, overrideAccess: false, user, context, draft: true, data: { title: `Test ${collection}`, slug: `audit-${collection}`, layout: [], ...(collection === 'services' ? { category } : {}), ...(collection === 'projects' ? { coverImage: media } : {}) } })
    created.push({ collection, id: document.id })
    for (const locale of locales) await payload.update({ collection, id: document.id, locale, overrideAccess: false, user, context, draft: true, data: { title: `${collection} ${locale}`, slug: `audit-${collection}-${locale}` } })
    for (const locale of locales) {
      const draft = await payload.findByID({ collection, id: document.id, locale, fallbackLocale: false, draft: true, overrideAccess: false, user })
      expect(draft.title).toBe(`${collection} ${locale}`)
      expect(draft._status).toBe('draft')
    }
    await payload.update({ collection, id: document.id, overrideAccess: false, user, context, data: { _status: 'published' } })
    expect((await payload.findByID({ collection, id: document.id, overrideAccess: false }))._status).toBe('published')
  }
  for (const locale of locales) await payload.update({ collection: 'service-categories', id: category, locale, overrideAccess: false, user, context, data: { title: `Category ${locale}`, slug: `audit-category-${locale}` } })
  for (const locale of locales) expect((await payload.findByID({ collection: 'service-categories', id: category, locale, fallbackLocale: false })).title).toBe(`Category ${locale}`)
  await expect(payload.delete({ collection: 'service-categories', id: category, overrideAccess: false, user, context })).rejects.toThrow('Suppression impossible')
  await expect(payload.delete({ collection: 'media', id: media, overrideAccess: false, user, context })).rejects.toThrow('Suppression impossible')
  expect((await payload.findByID({ collection: 'services', id: created.find((entry) => entry.collection === 'services')!.id, depth: 0 })).category).toBe(category)
  // Remove the current reference; retained project history must still protect it.
  await payload.update({ collection: 'projects', id: created.find((entry) => entry.collection === 'projects')!.id, overrideAccess: false, user, context, data: { coverImage: null } })
  await expect(payload.delete({ collection: 'media', id: media, overrideAccess: false, user, context })).rejects.toThrow('Suppression impossible')
  for (const entry of created) await payload.delete({ ...entry, overrideAccess: false, user, context })
  await payload.delete({ collection: 'service-categories', id: category, overrideAccess: false, user, context })
}, 180_000)

it('saves localized Ads, activation/schedule and media replacement, then safely deletes unreferenced fixtures', async () => {
  const ad = await payload.create({ collection: 'advertisements', overrideAccess: false, user, context, data: { name: 'Isolated ad', alt: 'Test fr', desktopImage: [media], active: false } })
  for (const locale of locales) await payload.update({ collection: 'advertisements', id: ad.id, locale, overrideAccess: false, user, context, data: { alt: `Ad ${locale}` } })
  for (const locale of locales) expect((await payload.findByID({ collection: 'advertisements', id: ad.id, locale, fallbackLocale: false })).alt).toBe(`Ad ${locale}`)
  const updated = await payload.update({ collection: 'advertisements', id: ad.id, overrideAccess: false, user, context, data: { active: true, startAt: '2030-01-01T00:00:00Z', endAt: '2030-01-02T00:00:00Z', mobileImage: [media] } })
  expect(updated.active).toBe(true)
  expect(updated.startAt).toContain('2030-01-01')
  await expect(payload.delete({ collection: 'media', id: media, overrideAccess: false, user, context })).rejects.toThrow('Suppression impossible')
  await payload.delete({ collection: 'advertisements', id: ad.id, overrideAccess: false, user, context })
  await payload.delete({ collection: 'media', id: media, overrideAccess: false, user, context })
  await expect(payload.findByID({ collection: 'media', id: media })).rejects.toThrow()
}, 120_000)
