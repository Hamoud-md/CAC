import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

/**
 * TEMPORARY MBI wordmark placeholder (context.md §2 — no real vector logo supplied yet).
 * Replace with the official MBI logo asset via SiteSettings in Phase 2.
 */
export const Logo = ({ className }: Props) => {
  return (
    <span
      className={clsx('inline-flex flex-col leading-none select-none', className)}
      aria-label="MBI — Modern Building Industry"
    >
      <span
        className="text-[1.75rem] font-extrabold tracking-tight"
        style={{ color: 'var(--mbi-purple)' }}
      >
        MBI
      </span>
      <span
        className="text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
        style={{ color: 'var(--mbi-text-muted)' }}
      >
        Modern Building Industry
      </span>
    </span>
  )
}
