import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { DM_Sans, Manrope, Noto_Sans_Arabic } from 'next/font/google'
import React from 'react'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
  display: 'swap',
})
import { draftMode } from 'next/headers'

import { AdminBar } from '@/components/AdminBar'
import { SiteFooter } from '@/Footer/Component'
import { SiteHeader } from '@/Header/Component'
import { AdRail } from '@/components/Ads/AdRail'
import { pageContextFromHeaders } from '@/lib/pageContext'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'
import { LOCALES, dir, isLocale, type Locale } from '@/lib/locales'

import '../globals.css'

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

type Args = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Args) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const { isEnabled } = await draftMode()
  const adContext = await pageContextFromHeaders()

  return (
    <html
      className={cn(dmSans.variable, manrope.variable, notoArabic.variable)}
      lang={locale}
      dir={dir(locale)}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <AdminBar adminBarProps={{ preview: isEnabled }} />

          <SiteHeader locale={locale as Locale} />

          {/* Content + advertising rail (context.md §6). Single column below lg. */}
          <div className="mbi-shell grid w-full flex-1 grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-16 md:py-12">
            <main className="min-w-0">{children}</main>
            <aside
              className="hidden lg:block min-w-0"
              aria-label="Publicité"
              style={{ position: 'sticky', top: 'calc(var(--mbi-sticky-offset) + 1.5rem)', alignSelf: 'start' }}
            >
              <AdRail locale={locale as Locale} pageContext={adContext} />
            </aside>
          </div>

          <SiteFooter locale={locale as Locale} />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: { card: 'summary_large_image' },
}
