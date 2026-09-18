import React from 'react'

import { getNav, getNavPages, getSiteSettings } from '@/lib/data'
import type { Locale } from '@/lib/locales'
import { HeaderClient } from './Component.client'

export async function SiteHeader({ locale }: { locale: Locale }) {
  const [settings, nav, navPages] = await Promise.all([
    getSiteSettings(locale),
    getNav(locale),
    getNavPages(locale),
  ])

  const logoUrl =
    settings?.logo && typeof settings.logo === 'object' ? (settings.logo.url ?? null) : null

  const fromSettings = (settings?.secondaryNav ?? []).map((n) => ({
    label: n.label ?? '',
    href: n.href ?? '#',
  }))
  const linked = new Set(fromSettings.map((n) => n.href))
  const fromPages = navPages
    .filter((p) => !linked.has(`/${p.slug}`))
    .map((p) => ({ label: p.title ?? '', href: `/${p.slug}` }))

  return (
    <HeaderClient
      locale={locale}
      contact={{
        phone: settings?.phone ?? null,
        email: settings?.email ?? null,
        address: settings?.address ?? null,
      }}
      logoUrl={logoUrl}
      secondaryNav={[...fromSettings, ...fromPages]}
      categories={nav}
      viewAllLabel={settings?.viewAllLabel ?? null}
    />
  )
}
