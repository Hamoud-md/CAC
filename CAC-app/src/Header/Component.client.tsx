'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Menu, X, Phone, Mail, MapPin, ChevronRight, ChevronDown } from 'lucide-react'

import type { NavCategory } from '@/lib/data'
import { localeShort, LOCALES, type Locale } from '@/lib/locales'
import { LocaleSwitcher } from './LocaleSwitcher'
import { CategoryNav } from './CategoryNav'

type Props = {
  locale: Locale
  contact: { phone: string | null; email: string | null; address: string | null }
  logoUrl: string | null
  secondaryNav: { label: string; href: string }[]
  categories: NavCategory[]
  viewAllLabel?: string | null
}

const localize = (locale: Locale, href: string) =>
  href.startsWith('/') ? `/${locale}${href}` : href

export const HeaderClient: React.FC<Props> = ({
  locale,
  contact,
  logoUrl,
  secondaryNav,
  categories,
  viewAllLabel,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openCat, setOpenCat] = useState<string | null>(null)
  // Observe only the *sticky* part (strip + bar + desktop cat-nav) — never the
  // expandable mobile menu, or opening it feeds its own height back into the
  // var its max-height depends on (that was the flicker).
  const stickyRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
    setOpenCat(null)
  }, [pathname])

  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const sync = () =>
      document.documentElement.style.setProperty('--mbi-sticky-offset', `${el.offsetHeight}px`)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const hasContact = contact.phone || contact.email || contact.address
  const logo = logoUrl ?? '/images/mbi-logo-primary.png'

  const catLink =
    'mbi-focus flex items-center justify-between rounded-md px-1 py-3 text-[0.95rem] font-medium text-[var(--mbi-text)] border-b border-[var(--mbi-border)] last:border-b-0'

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div ref={stickyRef} className="border-b border-[var(--mbi-border)] bg-white">
        {/* Contact strip */}
        {hasContact && (
          <div style={{ background: 'var(--mbi-contact-strip)' }} className="text-white">
            <div className="mbi-shell flex items-center justify-center gap-x-7 gap-y-1 py-2 text-[0.8125rem] max-sm:justify-between max-sm:gap-x-4">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-white/85 transition-colors hover:text-white"
                >
                  <Phone size={14} strokeWidth={2} className="shrink-0" aria-hidden />
                  <span dir="ltr" className="whitespace-nowrap">
                    {contact.phone}
                  </span>
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 text-white/85 transition-colors hover:text-white"
                >
                  <Mail size={14} strokeWidth={2} className="shrink-0" aria-hidden />
                  <span dir="ltr" className="truncate">
                    {contact.email}
                  </span>
                </a>
              )}
              {contact.address && (
                <span className="hidden items-center gap-2 text-white/85 md:flex">
                  <MapPin size={14} strokeWidth={2} className="shrink-0" aria-hidden />
                  {contact.address}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Main bar */}
        <div className="mbi-shell flex h-[var(--mbi-header-h)] items-center justify-between gap-6">
          <Link
            href={`/${locale}`}
            aria-label="MBI — Modern Building Industry"
            className="flex shrink-0 items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt="MBI — Modern Building Industry"
              width={200}
              height={100}
              className="h-10 w-auto md:h-[3.25rem]"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {secondaryNav.map((item) => {
              const href = localize(locale, item.href)
              const active = pathname === href
              return (
                <Link
                  key={item.href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    'mbi-focus rounded text-[0.9375rem] font-medium transition-colors ' +
                    (active
                      ? 'text-[var(--mbi-purple)]'
                      : 'text-[var(--mbi-text)] hover:text-[var(--mbi-purple)]')
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LocaleSwitcher current={locale} locales={LOCALES} labels={localeShort} />
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="mbi-focus grid h-9 w-9 place-items-center rounded-md border border-[var(--mbi-border)] text-[var(--mbi-text)] md:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Desktop category bar with dropdowns */}
        <div className="hidden md:block">
          <CategoryNav categories={categories} locale={locale} viewAllLabel={viewAllLabel} />
        </div>
      </div>

      {/* Mobile slide-down menu — outside the observed sticky wrapper */}
      {menuOpen && (
        <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--mbi-sticky-offset))] overflow-y-auto overscroll-contain border-b border-[var(--mbi-border)] bg-white shadow-lg md:hidden">
          <nav className="mbi-shell flex flex-col py-2">
            {secondaryNav.map((item) => (
              <Link key={item.href} href={localize(locale, item.href)} className={catLink}>
                {item.label}
                <ChevronRight size={16} className="text-[var(--mbi-text-muted)] rtl:rotate-180" />
              </Link>
            ))}

            {categories.map((cat) => {
              const base = `/${locale}/services/${cat.slug}`
              if (cat.hasPage) {
                return (
                  <Link key={cat.id} href={base} className={catLink}>
                    {cat.title}
                    <ChevronRight size={16} className="text-[var(--mbi-text-muted)] rtl:rotate-180" />
                  </Link>
                )
              }
              const isOpen = openCat === cat.slug
              return (
                <div key={cat.id} className="border-b border-[var(--mbi-border)] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpenCat(isOpen ? null : cat.slug)}
                    aria-expanded={isOpen}
                    className="mbi-focus flex w-full items-center justify-between rounded-md px-1 py-3 text-[0.95rem] font-medium text-[var(--mbi-text)]"
                  >
                    {cat.title}
                    <ChevronDown
                      size={16}
                      className={
                        'text-[var(--mbi-text-muted)] transition-transform ' +
                        (isOpen ? 'rotate-180' : '')
                      }
                    />
                  </button>
                  {isOpen && (
                    <ul className="pb-2">
                      {cat.services.map((s) => (
                        <li key={s.id}>
                          <Link
                            href={`/${locale}/services/${cat.slug}/${s.slug}`}
                            className="mbi-focus block rounded-md px-3 py-2.5 text-[0.9rem] text-[var(--mbi-text-soft)]"
                          >
                            {s.title}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={base}
                          className="mbi-focus block rounded-md px-3 py-2.5 text-[0.85rem] font-semibold text-[var(--mbi-purple)]"
                        >
                          {viewAllLabel || (locale === 'ar' ? 'عرض الكل' : locale === 'en' ? 'View all' : 'Tout voir')} →
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
