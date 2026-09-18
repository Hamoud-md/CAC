import { NextRequest, NextResponse } from 'next/server'

import { DEFAULT_LOCALE, LOCALES } from './lib/locales'

const PUBLIC_FILE = /\.[^/]+$/

function pickLocale(req: NextRequest): string {
  const header = req.headers.get('accept-language') ?? ''
  const preferred = header.split(',').map((p) => p.split(';')[0].trim().slice(0, 2).toLowerCase())
  return preferred.find((p) => (LOCALES as readonly string[]).includes(p)) ?? DEFAULT_LOCALE
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/next') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/media') ||
    pathname.endsWith('-sitemap.xml') ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  if (hasLocale) {
    const res = NextResponse.next()
    res.headers.set('x-mbi-path', pathname)
    return res
  }

  const locale = pickLocale(req)
  const url = req.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
