import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { Media } from '@/components/Media'
import { getProjects } from '@/lib/data'
import { isLocale, type Locale } from '@/lib/locales'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ locale: string }> }

export default async function ProjectsPage({ params }: Args) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const projects = await getProjects(locale)

  return (
    <div className="py-4">
      <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold text-[var(--mbi-text)]">
        {locale === 'ar' ? 'المشاريع' : locale === 'en' ? 'Projects' : 'Projets'}
      </h1>

      {projects.length === 0 ? (
        <p className="mt-6 text-[var(--mbi-text-muted)]">
          {locale === 'ar'
            ? 'لا توجد مشاريع منشورة بعد.'
            : locale === 'en'
              ? 'No published projects yet.'
              : 'Aucun projet publié pour le moment.'}
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {projects.map((p) => {
            const cover = p.coverImage && typeof p.coverImage === 'object' ? p.coverImage : null
            return (
              <li key={p.id}>
                <Link
                  href={`/${locale}/projets/${p.slug}`}
                  className="block overflow-hidden rounded-xl border border-[var(--mbi-border)] bg-white"
                >
                  {cover && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <Media resource={cover} imgClassName="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="p-4">
                    {p.category && (
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--mbi-text-muted)]">
                        {p.category}
                      </p>
                    )}
                    <p className="mt-1 font-semibold text-[var(--mbi-text)]">{p.title}</p>
                    {p.summary && (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--mbi-text-muted)]">
                        {p.summary}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export const metadata: Metadata = { title: 'Projets | CAC' }
