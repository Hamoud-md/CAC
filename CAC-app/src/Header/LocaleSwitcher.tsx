'use client'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import { LOCALES, type Locale } from '@/lib/locales'

/** Swaps the locale segment, keeping the rest of the path (context.md §10). */
export const LocaleSwitcher: React.FC<{
  current: Locale
  locales: readonly Locale[]
  labels: Record<Locale, string>
}> = ({ current, locales, labels }) => {
  const pathname = usePathname()
  const router = useRouter()

  const swap = (next: Locale) => {
    const parts = (pathname || '/').split('/')
    if (LOCALES.includes(parts[1] as Locale)) parts[1] = next
    else parts.splice(1, 0, next)
    router.push(parts.join('/') || `/${next}`)
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-md bg-[var(--mbi-surface-muted)] p-0.5 text-[0.75rem] font-semibold"
      role="group"
      aria-label="Langue"
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => swap(l)}
          aria-pressed={l === current}
          aria-label={labels[l]}
          className={
            'mbi-focus rounded-[5px] px-2 py-1 transition-colors ' +
            (l === current
              ? 'bg-white text-[var(--mbi-purple)] shadow-[0_1px_2px_rgba(19,12,56,0.12)]'
              : 'text-[var(--mbi-text-muted)] hover:text-[var(--mbi-text)]')
          }
        >
          {labels[l]}
        </button>
      ))}
    </div>
  )
}
