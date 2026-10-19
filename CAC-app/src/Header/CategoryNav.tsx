'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { NavCategory } from '@/lib/data'
import type { Locale } from '@/lib/locales'

/** Ordered Payload category bar with a keyboard and pointer accessible submenu. */
export function CategoryNav({
  categories,
  locale,
  viewAllLabel,
}: {
  categories: NavCategory[]
  locale: Locale
  viewAllLabel?: string | null
}) {
  const [open, setOpen] = useState<string | null>(null)
  const [position, setPosition] = useState({ left: 8, top: 8 })
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const pathname = usePathname()

  useEffect(() => setOpen(null), [pathname])
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !open) return
      e.preventDefault()
      triggerRefs.current.get(open)?.focus()
      setOpen(null)
    }
    const onViewportChange = (event: Event) => {
      // Captured scroll events also come from the scrollable submenu itself.
      if (
        event.type === 'scroll' &&
        event.target instanceof Element &&
        rootRef.current?.querySelector('[role="menu"]')?.contains(event.target)
      ) return
      setOpen(null)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  }, [open])

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(null), 130)
  }
  const showMenu = (slug: string, trigger: HTMLButtonElement, focusFirst = false) => {
    cancelClose()
    const rect = trigger.getBoundingClientRect()
    const width = Math.min(384, window.innerWidth - 32)
    const height = Math.min(384, window.innerHeight - 32)
    setPosition({
      left: Math.max(16, Math.min(rect.left, window.innerWidth - width - 16)),
      top: Math.max(16, Math.min(rect.bottom + 2, window.innerHeight - height - 16)),
    })
    setOpen(slug)
    if (focusFirst) requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus())
  }

  if (categories.length === 0) return null
  const viewAll = viewAllLabel || (locale === 'ar' ? 'عرض الكل' : locale === 'en' ? 'View all' : 'Tout voir')

  return (
    <div ref={rootRef} className="cac-category-nav">
      <nav className="mbi-shell" aria-label={locale === 'ar' ? 'فئات الخدمات' : locale === 'en' ? 'Service categories' : 'Catégories de services'}>
        <ul className="cac-category-tabs">
          {categories.map((cat) => {
            const base = `/${locale}/services/${cat.slug}`
            const isOpen = open === cat.slug
            const onCat = pathname.startsWith(base)
            const linkCls = 'cac-category-link mbi-focus'

            if (cat.hasPage) {
              return (
                <li key={cat.id}>
                  <Link href={base} aria-current={onCat ? 'page' : undefined} className={linkCls}>
                    {cat.title}
                  </Link>
                </li>
              )
            }

            const menuId = `cac-service-menu-${String(cat.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`
            return (
              <li key={cat.id} className="cac-category-item" onMouseEnter={(event) => {
                const trigger = event.currentTarget.querySelector('button')
                if (trigger) showMenu(cat.slug, trigger)
              }} onMouseLeave={scheduleClose}>
                <button
                  ref={(node) => { if (node) triggerRefs.current.set(cat.slug, node); else triggerRefs.current.delete(cat.slug) }}
                  id={`${menuId}-trigger`}
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  aria-controls={menuId}
                  onClick={(event) => isOpen ? setOpen(null) : showMenu(cat.slug, event.currentTarget)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') { event.preventDefault(); showMenu(cat.slug, event.currentTarget, true) }
                  }}
                  className={`${linkCls} ${isOpen || onCat ? 'is-active' : ''}`}
                >
                  <span>{cat.title}</span>
                  <ChevronDown size={14} className={isOpen ? 'is-rotated' : ''} aria-hidden />
                </button>
                {isOpen && (
                  <div id={menuId} role="menu" aria-labelledby={`${menuId}-trigger`} className="cac-service-dropdown" style={{ left: position.left, top: position.top }} onMouseEnter={cancelClose} onMouseLeave={scheduleClose} onKeyDown={(event) => {
                    const items = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]')]
                    const index = items.indexOf(document.activeElement as HTMLElement)
                    let next = -1
                    if (event.key === 'ArrowDown') next = (index + 1) % items.length
                    if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length
                    if (event.key === 'Home') next = 0
                    if (event.key === 'End') next = items.length - 1
                    if (next >= 0) { event.preventDefault(); items[next]?.focus() }
                  }}>
                    {cat.services.map((service) => (
                      <Link key={service.id} role="menuitem" href={`/${locale}/services/${cat.slug}/${service.slug}`} className="cac-service-dropdown-link mbi-focus">
                        {service.title}
                      </Link>
                    ))}
                    <div className="cac-service-dropdown-divider" />
                    <Link role="menuitem" href={base} className="cac-service-dropdown-link cac-view-all mbi-focus">
                      {viewAll} <span aria-hidden>{locale === 'ar' ? '←' : '→'}</span>
                    </Link>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
