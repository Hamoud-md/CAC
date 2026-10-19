import Link from 'next/link'
import React from 'react'
import { Phone, Mail, MapPin } from 'lucide-react'

import { getNav, getSiteSettings } from '@/lib/data'
import { ui, type Locale } from '@/lib/locales'
import { CAC_LOGO, CAC_NAME, secondaryLabels } from '@/components/site/brand'

export async function SiteFooter({ locale }: { locale: Locale }) {
  const [settings, nav] = await Promise.all([getSiteSettings(locale), getNav(locale)])
  const required = ['/projets', '/a-propos', '/contact']
  const items = [
    ...required.map((href, index) => ({ href, label: settings?.secondaryNav?.find((n) => n.href === href)?.label || secondaryLabels[locale][index] })),
    ...(settings?.secondaryNav ?? [])
      .filter((n) => !required.includes(n.href ?? ''))
      .map((n) => ({ label: n.label ?? '', href: n.href ?? '#' })),
  ]
  const logo = settings?.logo && typeof settings.logo === 'object' ? settings.logo.url || CAC_LOGO : CAC_LOGO
  const t = ui[locale]

  return (
    <footer className="mt-auto text-white/75" style={{ background: 'var(--mbi-purple-deep)' }}>
      <div className="mbi-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1.1fr] md:gap-12">
        <div>
          <span className="inline-flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt="CAC — Contemporary Artistic Construction"
              width={253}
              height={127}
              className="h-auto w-44"
            />
          </span>
          {settings?.tagline && (
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              {settings.tagline}
            </p>
          )}
        </div>

        <nav className="flex flex-col gap-2.5 text-sm">
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/40">
            {t.menu}
          </p>
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href.startsWith('/') ? `/${locale}${i.href}` : i.href}
              className="w-fit hover:text-white"
            >
              {i.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2.5 text-sm">
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/40">
            {t.contactUs}
          </p>
          {settings?.phone && (
            <a
              href={`tel:${settings.phone.replace(/\s/g, '')}`}
              dir="ltr"
              className="flex w-fit items-center gap-2.5 hover:text-white"
            >
              <Phone size={15} className="shrink-0 text-white/40" aria-hidden />
              {settings.phone}
            </a>
          )}
          {settings?.email && (
            <a
              href={`mailto:${settings.email}`}
              dir="ltr"
              className="flex w-fit items-center gap-2.5 hover:text-white"
            >
              <Mail size={15} className="shrink-0 text-white/40" aria-hidden />
              {settings.email}
            </a>
          )}
          {settings?.address && (
            <span className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-0.5 shrink-0 text-white/40" aria-hidden />
              {settings.address}
            </span>
          )}
        </div>
      </div>

      {nav.length > 0 && (
        <div className="border-t border-white/10">
          <div className="mbi-shell flex flex-wrap gap-x-6 gap-y-2 py-5 text-[0.8125rem] text-white/50">
            {nav.map((c) => (
              <Link
                key={String(c.slug)}
                href={`/${locale}/services/${c.slug}`}
                className="hover:text-white"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-white/10">
        <div className="mbi-shell py-4 text-xs text-white/40">
          © {new Date().getFullYear()} {CAC_NAME}
        </div>
      </div>
    </footer>
  )
}
