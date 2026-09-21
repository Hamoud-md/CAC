import { createReadStream } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'

const mimeTypes: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
}

const notFound = () => new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } })

function safeFilename(raw: string): string | null {
  let filename = raw
  try {
    // Next normally decodes params once. Decode remaining encoded layers too.
    for (let i = 0; i < 5 && /%[0-9a-f]{2}/i.test(filename); i++) {
      filename = decodeURIComponent(filename)
    }
  } catch {
    return null
  }

  if (
    !filename ||
    filename === '.' ||
    filename === '..' ||
    filename.includes('/') ||
    filename.includes('\\') ||
    filename.includes('\0') ||
    /%[0-9a-f]{2}/i.test(filename)
  ) {
    return null
  }
  return filename
}

function parseRange(value: string, size: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim())
  if (!match || (!match[1] && !match[2]) || size === 0) return null

  if (!match[1]) {
    const suffix = Number(match[2])
    if (!Number.isSafeInteger(suffix) || suffix < 1) return null
    return { start: Math.max(0, size - suffix), end: size - 1 }
  }

  const start = Number(match[1])
  const requestedEnd = match[2] ? Number(match[2]) : size - 1
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(requestedEnd) ||
    start >= size ||
    requestedEnd < start
  ) {
    return null
  }
  return { start, end: Math.min(requestedEnd, size - 1) }
}

/** Read an uploaded file at request time rather than relying on Next's public-file index. */
export async function serveMediaFile(request: Request, rawFilename: string, mediaRoot: string): Promise<Response> {
  const filename = safeFilename(rawFilename)
  if (!filename) return notFound()

  const root = path.resolve(mediaRoot)
  const filePath = path.resolve(root, filename)
  const relative = path.relative(root, filePath)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return notFound()

  try {
    // Reject symlinks pointing outside the volume as well as lexical traversal.
    const [realRoot, realFile, fileStats] = await Promise.all([realpath(root), realpath(filePath), stat(filePath)])
    const realRelative = path.relative(realRoot, realFile)
    if (!realRelative || realRelative.startsWith('..') || path.isAbsolute(realRelative) || !fileStats.isFile()) {
      return notFound()
    }

    const mimeType = mimeTypes[path.extname(filename).toLowerCase()] || 'application/octet-stream'
    const headers = new Headers({
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=300',
      'Content-Type': mimeType,
      'X-Content-Type-Options': 'nosniff',
    })
    if (mimeType === 'image/svg+xml') headers.set('Content-Security-Policy', "script-src 'none'")
    if (mimeType === 'application/octet-stream') headers.set('Content-Disposition', 'attachment')

    const rangeHeader = request.method === 'GET' ? request.headers.get('range') : null
    const range = rangeHeader ? parseRange(rangeHeader, fileStats.size) : null
    if (rangeHeader && !range) {
      headers.set('Content-Range', `bytes */${fileStats.size}`)
      return new Response(null, { status: 416, headers })
    }

    const start = range?.start ?? 0
    const end = range?.end ?? fileStats.size - 1
    headers.set('Content-Length', String(range ? end - start + 1 : fileStats.size))
    if (range) headers.set('Content-Range', `bytes ${start}-${end}/${fileStats.size}`)

    if (request.method === 'HEAD') return new Response(null, { status: 200, headers })
    const stream = createReadStream(realFile, range ? { start, end } : undefined)
    return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, {
      status: range ? 206 : 200,
      headers,
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return notFound()
    throw error
  }
}
