import Link from 'next/link'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import type { Locale } from '@/lib/locales'
import { ui } from '@/lib/locales'

type Doc = {
  title?: string | null
  summary?: string | null
  coverImage?: number | MediaType | null
  layout?: unknown
  ctaLabel?: string | null
  ctaHref?: string | null
}

/** One template for every category page and sub-service page (client requirement). */
export function ServicePageTemplate({
  doc,
  locale,
  eyebrow,
  backHref,
  backLabel,
  ctaDefault,
  children,
}: {
  doc: Doc
  locale: Locale
  eyebrow?: string | null
  backHref?: string
  backLabel?: string
  ctaDefault?: string | null
  children?: React.ReactNode
}) {
  const ctaLabel = doc.ctaLabel || ctaDefault || 'Discuter de votre projet'
  const cover = doc.coverImage && typeof doc.coverImage === 'object' ? doc.coverImage : null

  return (
    <article className="flex flex-col gap-10 py-2">
      {/* Blurred purple header band */}
      <header className="relative overflow-hidden rounded-xl px-6 py-10 text-white sm:px-9 sm:py-12">
        <div className="absolute inset-0 -z-10 bg-[var(--mbi-purple-dark)]" />
        {cover && (
          <div className="absolute inset-0 -z-10 opacity-30 blur-[2px]">
            <Media resource={cover} fill imgClassName="object-cover" />
          </div>
        )}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(110deg, var(--mbi-purple-dark) 10%, color-mix(in srgb, var(--mbi-purple-deep) 70%, transparent) 100%)',
          }}
        />
        {backHref && (
          <Link
            href={backHref}
            className="mbi-focus inline-flex items-center gap-1.5 rounded text-sm font-medium text-white/70 hover:text-white"
          >
            <span aria-hidden className="rtl:rotate-180">
              ←
            </span>
            {backLabel ?? ui[locale].ourServices}
          </Link>
        )}
        {eyebrow && (
          <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/60">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 max-w-[38rem] text-[clamp(1.7rem,4.5vw,2.6rem)] font-bold leading-[1.12] text-white">
          {doc.title}
        </h1>
        {doc.summary && (
          <p className="mt-4 max-w-[44rem] text-[0.975rem] leading-relaxed text-white/80">
            {doc.summary}
          </p>
        )}
      </header>

      {children}

      {Array.isArray(doc.layout) && doc.layout.length > 0 && (
        <RenderBlocks blocks={doc.layout as { blockType?: string }[]} />
      )}

      {doc.ctaHref && (
        <div className="mbi-card bg-[var(--mbi-surface-muted)] p-8 text-center">
          <Link
            href={doc.ctaHref.startsWith('/') ? `/${locale}${doc.ctaHref}` : doc.ctaHref}
            className="mbi-btn mbi-btn-primary mbi-focus"
          >
            {ctaLabel}
            <span aria-hidden className="inline-block rtl:rotate-180">
              →
            </span>
          </Link>
        </div>
      )}
    </article>
  )
}
