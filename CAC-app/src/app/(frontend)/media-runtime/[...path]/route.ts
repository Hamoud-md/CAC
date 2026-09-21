import path from 'node:path'
import { serveMediaFile } from '@/utilities/serveMediaFile'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ path: string[] }> }

async function serve(request: Request, { params }: Context): Promise<Response> {
  const segments = (await params).path
  if (segments.length !== 1) return new Response(null, { status: 404 })
  return serveMediaFile(request, segments[0], path.resolve(process.cwd(), 'public/media'))
}

export const GET = serve
export const HEAD = serve
