'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { NavCategory } from '@/lib/data'
import type { Locale } from '@/lib/locales'

/**
 * Desktop category bar. A category with sub-services opens a small dropdown
 * anchored to its own tab (hover AND click); a category with none links straight
 * to its page.
 */
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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => setOpen(null), [pathname])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const cancelClose = () => closeTimer.current && clearTimeout(closeTimer.current)
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(null), 130)
  }

  if (categories.length === 0) return null
  const viewAll = viewAllLabel || (locale === 'ar' ? 'عرض الكل' : locale === 'en' ? 'View all' : 'Tout voir')

  return (
    <div ref={rootRef} className="border-t border-[var(--mbi-border)] bg-white">
      <nav className="mbi-shell" aria-label="Catégories de services">
        <ul className="flex flex-wrap items-stretch">
          {categories.map((cat) => {
            const base = `/${locale}/services/${cat.slug}`
            const isOpen = open === cat.slug
            const onCat = pathname.startsWith(base)
            const linkCls =
              'mbi-focus flex h-full items-center gap-1 px-3.5 py-3 text-[0.8125rem] font-medium transition-colors '

            if (cat.hasPage) {
              return (
                <li key={cat.id}>
                  <Link
                    href={base}
                    className={
                      linkCls +
                      (onCat
                        ? 'text-[var(--mbi-purple)]'
                        : 'text-[var(--mbi-text)] hover:text-[var(--mbi-purple)]')
                    }
                  >
                    {cat.title}
                  </Link>
                </li>
              )
            }

            return (
              <li
                key={cat.id}
                className="relative"
                onMouseEnter={() => {
                  cancelClose()
                  setOpen(cat.slug)
                }}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  onClick={() => setOpen(isOpen ? null : cat.slug)}
                  className={
                    linkCls +
                    (isOpen || onCat
                      ? 'text-[var(--mbi-purple)]'
                      : 'text-[var(--mbi-text)] hover:text-[var(--mbi-purple)]')
                  }
                >
                  {cat.title}
                  <ChevronDown
                    size={14}
                    className={'transition-transform ' + (isOpen ? 'rotate-180' : '')}
                    aria-hidden
                  />
                </button>

                {isOpen && (
                  <div
                    role="menu"
                    className="absolute start-2 top-full z-50 min-w-[15rem] rounded-lg border border-[var(--mbi-border)] bg-white py-1.5 shadow-[0_16px_32px_-14px_rgba(19,12,56,0.3)]"
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    {cat.services.map((s) => (
                      <Link
                        key={s.id}
                        role="menuitem"
                        href={`/${locale}/services/${cat.slug}/${s.slug}`}
                        className="mbi-focus block px-3.5 py-2 text-[0.875rem] font-medium text-[var(--mbi-text)] transition-colors hover:bg-[var(--mbi-surface-muted)] hover:text-[var(--mbi-purple)]"
                      >
                        {s.title}
                      </Link>
                    ))}
                    <div className="my-1 border-t border-[var(--mbi-border)]" />
                    <Link
                      href={base}
                      className="mbi-focus block px-3.5 py-2 text-[0.8125rem] font-semibold text-[var(--mbi-purple)] hover:bg-[var(--mbi-surface-muted)]"
                    >
                      {viewAll} <span aria-hidden className="rtl:rotate-180">→</span>
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
