'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import type { NavCategory } from '@/lib/data'
import { localeShort, LOCALES, type Locale } from '@/lib/locales'
import { LocaleSwitcher } from './LocaleSwitcher'
import { CategoryNav } from './CategoryNav'
import { CAC_LOGO, CAC_NAME, secondaryLabels } from '@/components/site/brand'

type Props = {
  locale: Locale
  contact: { phone: string | null; email: string | null; address: string | null }
  logoUrl: string | null
  secondaryNav: { label: string; href: string }[]
  categories: NavCategory[]
  viewAllLabel?: string | null
}

export const HeaderClient: React.FC<Props> = ({ locale, logoUrl, secondaryNav, categories, viewAllLabel }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileCategory, setMobileCategory] = useState<string | null>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const mobileCategoryButtons = useRef(new Map<string, HTMLButtonElement>())
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
    setMobileCategory(null)
  }, [pathname])
  useEffect(() => {
    const el = stickyRef.current
    if (!el) return
    const sync = () => document.documentElement.style.setProperty('--mbi-sticky-offset', `${el.offsetHeight}px`)
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      if (mobileCategory) {
        mobileCategoryButtons.current.get(mobileCategory)?.focus()
        setMobileCategory(null)
      } else {
        setMenuOpen(false)
        menuButton.current?.focus()
      }
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [menuOpen, mobileCategory])

  const required = ['/projets', '/a-propos', '/contact']
  const primary = required.map((href, index) => ({
    href: `/${locale}${href}`,
    label: secondaryNav.find((item) => item.href === href)?.label || secondaryLabels[locale][index],
  }))
  const extras = secondaryNav.filter((item) => !required.includes(item.href))
  const localize = (href: string) => href.startsWith('/') ? `/${locale}${href}` : href
  const allItemsLabel = viewAllLabel || (locale === 'ar' ? 'عرض الكل' : locale === 'en' ? 'View all' : 'Tout voir')
  const categoryPanelId = (category: NavCategory) => `cac-mobile-category-${String(category.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`
  const closeMobile = () => { setMenuOpen(false); setMobileCategory(null) }

  return (
    <header className="cac-header">
      <div ref={stickyRef}>
        <div className="mbi-shell cac-header-top">
          <Link href={`/${locale}`} aria-label={CAC_NAME} className="mbi-focus cac-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl || CAC_LOGO} alt={CAC_NAME} width={253} height={127} className="cac-logo" />
          </Link>
          <span className="cac-wordmark" aria-hidden="true">CONTEMPORARY<br />ARTISTIC CONSTRUCTION</span>
          <div className="cac-header-actions">
            <LocaleSwitcher current={locale} locales={LOCALES} labels={localeShort} />
            <button ref={menuButton} type="button" onClick={() => {
              if (menuOpen) closeMobile()
              else setMenuOpen(true)
            }} aria-label={locale === 'ar' ? 'القائمة' : locale === 'en' ? 'Menu' : 'Menu'} aria-controls="cac-mobile-nav" aria-expanded={menuOpen} className="cac-menu-button mbi-focus">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        <div className="cac-desktop-nav">
          <CategoryNav categories={categories} locale={locale} viewAllLabel={viewAllLabel} />
          <nav className="cac-main-nav mbi-shell" aria-label={locale === 'ar' ? 'صفحات الموقع' : locale === 'en' ? 'Main pages' : 'Pages principales'}>
            {primary.map((item) => (
              <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className="cac-nav-link mbi-focus">{item.label}</Link>
            ))}
            {extras.map((item) => {
              const href = localize(item.href)
              return <Link key={item.href} href={href} aria-current={pathname === href ? 'page' : undefined} className="cac-nav-link mbi-focus">{item.label}</Link>
            })}
          </nav>
        </div>
      </div>
      {menuOpen && (
        <nav id="cac-mobile-nav" className="cac-mobile-nav" aria-label={locale === 'ar' ? 'القائمة الرئيسية' : locale === 'en' ? 'Main navigation' : 'Navigation principale'}>
          <ul className="cac-mobile-list">
            {categories.map((category) => {
              const base = `/${locale}/services/${category.slug}`
              const expanded = mobileCategory === category.slug
              if (category.hasPage) return <li key={category.id}><Link href={base} className="cac-mobile-link mbi-focus" onClick={closeMobile}>{category.title}</Link></li>
              const panelId = categoryPanelId(category)
              return (
                <li key={category.id} className="cac-mobile-group">
                  <button ref={(node) => { if (node) mobileCategoryButtons.current.set(category.slug, node); else mobileCategoryButtons.current.delete(category.slug) }} type="button" className="cac-mobile-link cac-mobile-toggle mbi-focus" aria-expanded={expanded} aria-controls={panelId} onClick={() => setMobileCategory(expanded ? null : category.slug)}>
                    <span>{category.title}</span><ChevronDown size={16} aria-hidden className={expanded ? 'is-rotated' : ''} />
                  </button>
                  {expanded && <ul id={panelId} className="cac-mobile-subservices">
                    {category.services.map((service) => <li key={service.id}><Link href={`${base}/${service.slug}`} className="cac-mobile-link mbi-focus" onClick={closeMobile}>{service.title}</Link></li>)}
                    <li><Link href={base} className="cac-mobile-link cac-view-all mbi-focus" onClick={closeMobile}>{allItemsLabel}</Link></li>
                  </ul>}
                </li>
              )
            })}
            {primary.map((item) => <li key={item.href}><Link href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className="cac-mobile-link mbi-focus" onClick={closeMobile}>{item.label}</Link></li>)}
            {extras.map((item) => {
              const href = localize(item.href)
              return <li key={item.href}><Link href={href} aria-current={pathname === href ? 'page' : undefined} className="cac-mobile-link mbi-focus" onClick={closeMobile}>{item.label}</Link></li>
            })}
          </ul>
        </nav>
      )}
    </header>
  )
}
