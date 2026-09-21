import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { serveMediaFile } from '@/utilities/serveMediaFile'

let mediaRoot: string
const request = (method = 'GET', range?: string) =>
  new Request('http://localhost/media/example.mp4', {
    method,
    headers: range ? { Range: range } : undefined,
  })

beforeEach(async () => {
  mediaRoot = await mkdtemp(path.join(tmpdir(), 'mbi-media-test-'))
})

afterEach(async () => {
  await rm(mediaRoot, { recursive: true, force: true })
})

describe('persistent media serving', () => {
  it('streams an existing MP4 with its correct size and content type', async () => {
    await writeFile(path.join(mediaRoot, 'example.mp4'), 'video-data')
    const response = await serveMediaFile(request(), 'example.mp4', mediaRoot)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('video/mp4')
    expect(response.headers.get('content-length')).toBe('10')
    expect(await response.text()).toBe('video-data')
  })

  it('returns a non-cacheable 404 for a missing file', async () => {
    const response = await serveMediaFile(request(), 'missing.mp4', mediaRoot)
    expect(response.status).toBe(404)
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('serves a byte range with precise 206 headers and content', async () => {
    await writeFile(path.join(mediaRoot, 'example.mp4'), '0123456789')
    const response = await serveMediaFile(request('GET', 'bytes=0-3'), 'example.mp4', mediaRoot)
    expect(response.status).toBe(206)
    expect(response.headers.get('content-range')).toBe('bytes 0-3/10')
    expect(response.headers.get('content-length')).toBe('4')
    expect(response.headers.get('accept-ranges')).toBe('bytes')
    expect(await response.text()).toBe('0123')
  })

  it('supports suffix ranges for seeking near the end', async () => {
    await writeFile(path.join(mediaRoot, 'example.mp4'), '0123456789')
    const response = await serveMediaFile(request('GET', 'bytes=-3'), 'example.mp4', mediaRoot)
    expect(response.status).toBe(206)
    expect(response.headers.get('content-range')).toBe('bytes 7-9/10')
    expect(await response.text()).toBe('789')
  })

  it('rejects unsatisfiable and malformed ranges with 416', async () => {
    await writeFile(path.join(mediaRoot, 'example.mp4'), '0123456789')
    for (const range of ['bytes=10-20', 'bytes=5-2', 'bytes=0-1,3-4']) {
      const response = await serveMediaFile(request('GET', range), 'example.mp4', mediaRoot)
      expect(response.status).toBe(416)
      expect(response.headers.get('content-range')).toBe('bytes */10')
    }
  })

  it('rejects lexical and encoded traversal', async () => {
    for (const filename of [
      '../secrets.txt',
      '..\\secrets.txt',
      '%2e%2e%2fsecrets.txt',
      '%252e%252e%252fsecrets.txt',
    ]) {
      expect((await serveMediaFile(request(), filename, mediaRoot)).status).toBe(404)
    }
  })

  it('returns the appropriate image type and safe SVG headers', async () => {
    await writeFile(path.join(mediaRoot, 'image.webp'), 'image-data')
    await writeFile(path.join(mediaRoot, 'icon.svg'), '<svg/>')
    const image = await serveMediaFile(request(), 'image.webp', mediaRoot)
    expect(image.status).toBe(200)
    expect(image.headers.get('content-type')).toBe('image/webp')
    await image.arrayBuffer()
    const svg = await serveMediaFile(request(), 'icon.svg', mediaRoot)
    expect(svg.headers.get('content-type')).toBe('image/svg+xml')
    expect(svg.headers.get('content-security-policy')).toContain("script-src 'none'")
    await svg.arrayBuffer()
  })

  it('answers HEAD without downloading a body', async () => {
    await writeFile(path.join(mediaRoot, 'example.mp4'), '0123456789')
    const response = await serveMediaFile(request('HEAD'), 'example.mp4', mediaRoot)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-length')).toBe('10')
    expect(response.body).toBeNull()
  })

  it('finds files created after the first request without a restart', async () => {
    expect((await serveMediaFile(request(), 'example.mp4', mediaRoot)).status).toBe(404)
    await writeFile(path.join(mediaRoot, 'example.mp4'), 'new-video')
    const response = await serveMediaFile(request(), 'example.mp4', mediaRoot)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('new-video')
  })

  it('closes an aborted response stream without an uncaught controller error', async () => {
    await writeFile(path.join(mediaRoot, 'example.mp4'), Buffer.alloc(1024 * 1024, 7))
    const uncaught: unknown[] = []
    const recordUncaught = (error: unknown) => uncaught.push(error)
    process.on('uncaughtExceptionMonitor', recordUncaught)

    try {
      const response = await serveMediaFile(request(), 'example.mp4', mediaRoot)
      const reader = response.body!.getReader()
      expect((await reader.read()).done).toBe(false)
      await expect(reader.cancel('client navigated away')).resolves.toBeUndefined()
      await new Promise<void>((resolve) => setImmediate(resolve))
      expect(uncaught).toEqual([])
    } finally {
      process.off('uncaughtExceptionMonitor', recordUncaught)
    }
  })
})
