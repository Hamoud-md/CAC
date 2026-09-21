// @vitest-environment node

import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let tempRoot: string
let mediaID: number | string
let originalMediaFiles: Set<string>

beforeAll(async () => {
  tempRoot = await mkdtemp(path.join(tmpdir(), 'mbi-description-payload-'))
  process.env.DATABASE_URL = `file:${path.join(tempRoot, 'payload.db')}`
  process.env.PAYLOAD_SECRET = 'integration-test-secret-at-least-32-characters'
  process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3000'

  const mediaRoot = path.resolve('public/media')
  originalMediaFiles = new Set(await readdir(mediaRoot).catch(() => []))

  const source = path.join(tempRoot, 'description-test.png')
  await writeFile(
    source,
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X8h9WQAAAABJRU5ErkJggg==',
      'base64',
    ),
  )

  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('../../src/payload.config'),
  ])
  payload = await getPayload({ config })
  const created = await payload.create({
    collection: 'media',
    locale: 'fr',
    fallbackLocale: false,
    filePath: source,
    data: { alt: 'Test description', decorative: false },
  })
  mediaID = created.id
}, 120_000)

afterAll(async () => {
  if (payload && mediaID) await payload.delete({ collection: 'media', id: mediaID })
  if (payload) await payload.destroy()

  const mediaRoot = path.resolve('public/media')
  const current = await readdir(mediaRoot).catch(() => [])
  await Promise.all(
    current
      .filter((filename) => !originalMediaFiles.has(filename))
      .map((filename) => rm(path.join(mediaRoot, filename), { force: true })),
  )
  // SQLite can remain locked until Vitest exits on Windows. The OS temp
  // directory is cleaned by the test runner host after the process closes.
})

describe('Payload Media description persistence', () => {
  it('persists a French description after reload', async () => {
    const reloaded = await payload.findByID({
      collection: 'media',
      id: mediaID,
      locale: 'fr',
      fallbackLocale: false,
    })
    expect(reloaded.alt).toBe('Test description')
  })

  it('persists an explicitly cleared French description after reload', async () => {
    await payload.update({
      collection: 'media',
      id: mediaID,
      locale: 'fr',
      fallbackLocale: false,
      data: { alt: null },
    })
    const reloaded = await payload.findByID({
      collection: 'media',
      id: mediaID,
      locale: 'fr',
      fallbackLocale: false,
    })
    expect(reloaded.alt).toBeNull()
  })

  it('persists independent French, Arabic, and English descriptions', async () => {
    const descriptions = {
      fr: 'Description française',
      ar: 'وصف عربي',
      en: 'English description',
    } as const

    for (const [locale, alt] of Object.entries(descriptions)) {
      await payload.update({
        collection: 'media',
        id: mediaID,
        locale: locale as keyof typeof descriptions,
        fallbackLocale: false,
        data: { alt },
      })
    }

    for (const [locale, expected] of Object.entries(descriptions)) {
      const reloaded = await payload.findByID({
        collection: 'media',
        id: mediaID,
        locale: locale as keyof typeof descriptions,
        fallbackLocale: false,
      })
      expect(reloaded.alt).toBe(expected)
    }
  })
})
