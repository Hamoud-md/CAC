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
        <link href="/images/cac-logo-original.png" rel="icon" type="image/png" />
      </head>
      <body className="cac-public">
        <Providers>
          <a href="#main-content" className="cac-skip">
            {locale === 'ar'
              ? 'انتقل إلى المحتوى'
              : locale === 'en'
                ? 'Skip to content'
                : 'Aller au contenu'}
          </a>
          <AdminBar adminBarProps={{ preview: isEnabled }} />

          <SiteHeader locale={locale as Locale} />

          {/* Full-width editorial content; existing desktop ads follow the page. */}
          <div className="mbi-shell cac-content w-full flex-1 py-8 md:py-12">
            <main id="main-content" tabIndex={-1} className="min-w-0">
              {children}
            </main>
            <aside className="cac-ad-band hidden lg:block min-w-0" aria-label="Publicité">
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
