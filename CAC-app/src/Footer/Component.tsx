import Link from 'next/link'
import React from 'react'
import { Phone, Mail, MapPin } from 'lucide-react'

import { getNav, getSiteSettings } from '@/lib/data'
import { ui, type Locale } from '@/lib/locales'
import { DEFAULT_LOGO_SRC } from '@/components/Logo/Logo'

export async function SiteFooter({ locale }: { locale: Locale }) {
  const [settings, nav] = await Promise.all([getSiteSettings(locale), getNav(locale)])
  const items = (settings?.secondaryNav ?? []).map((n) => ({ label: n.label ?? '', href: n.href ?? '#' }))
  const logoUrl =
    settings?.logo && typeof settings.logo === 'object' ? (settings.logo.url ?? null) : null
  const logo = logoUrl ?? DEFAULT_LOGO_SRC
  const t = ui[locale]

  return (
    <footer className="mt-auto text-white/75" style={{ background: 'var(--mbi-purple-deep)' }}>
      <div className="mbi-shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1.1fr] md:gap-12">
        <div>
          <span className="inline-flex rounded-md bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt="CAC — Contemporary Artistic Construction"
              width={592}
              height={771}
              className="h-16 w-auto"
            />
          </span>
          {settings?.tagline && (
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">{settings.tagline}</p>
          )}
        </div>

        <nav className="flex flex-col gap-2.5 text-sm">
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/40">
            {t.menu}
          </p>
          {items.map((i) => (
            <Link key={i.href} href={`/${locale}${i.href}`} className="w-fit hover:text-white">
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
          © {new Date().getFullYear()} MBI — Modern Building Industry
        </div>
      </div>
    </footer>
  )
}
