import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { Media } from '@/components/Media'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { ContentMediaCarousel } from '@/components/site/ContentMediaCarousel'
import type { Media as MediaType } from '@/payload-types'
import { getProjectBySlug } from '@/lib/data'
import { isLocale, type Locale } from '@/lib/locales'
import { generateMeta } from '@/utilities/generateMeta'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ locale: string; slug: string }> }

export default async function ProjectPage({ params }: Args) {
  const { locale: raw, slug } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale
  const project = await getProjectBySlug(decodeURIComponent(slug), locale)
  if (!project) return <PayloadRedirects url={`/${locale}/projets/${decodeURIComponent(slug)}`} />


  const cover =
    project.coverImage && typeof project.coverImage === 'object' ? project.coverImage : null
  const mediaGallery = Array.isArray(project.mediaGallery)
    ? project.mediaGallery.filter((item): item is MediaType => typeof item === 'object' && item !== null)
    : []

  return (
    <article className="flex flex-col gap-10 py-4">
      <header>
        <Link
          href={`/${locale}/projets`}
          className="text-sm text-[var(--mbi-text-muted)] hover:text-[var(--mbi-purple)]"
        >
          ← {locale === 'ar' ? 'المشاريع' : locale === 'en' ? 'Projects' : 'Projets'}
        </Link>
        <h1 className="mt-3 text-[clamp(1.8rem,4vw,2.75rem)] font-extrabold leading-tight text-[var(--mbi-text)]">
          {project.title}
        </h1>
        <p className="mt-2 flex flex-wrap gap-x-4 text-sm text-[var(--mbi-text-muted)]">
          {project.category && <span>{project.category}</span>}
          {project.location && <span>{project.location}</span>}
          {project.completedAt && (
            <span>{new Date(project.completedAt).getFullYear()}</span>
          )}
        </p>
        {project.summary && (
          <p className="mt-4 max-w-[46rem] text-lg text-[var(--mbi-text-muted)]">{project.summary}</p>
        )}
      </header>

      {cover && (
        <div className="overflow-hidden rounded-2xl border border-[var(--mbi-border)]">
          <Media resource={cover} imgClassName="w-full object-cover" priority />
        </div>
      )}

      {mediaGallery.length > 0 && <ContentMediaCarousel media={mediaGallery} />}

      <RenderBlocks blocks={project.layout as { blockType?: string }[]} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale = (isLocale(raw) ? raw : 'fr') as Locale
  const project = await getProjectBySlug(decodeURIComponent(slug), locale)
  return generateMeta({ doc: project })
}
