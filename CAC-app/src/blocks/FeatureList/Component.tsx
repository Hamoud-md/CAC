import React from 'react'

import type { FeatureListBlock as FeatureListBlockProps } from '@/payload-types'

export const FeatureListBlock: React.FC<Partial<FeatureListBlockProps>> = ({ heading, items }) => {
  if (!items?.length) return null
  return (
    <section>
      {heading && (
        <h2 className="mb-6 text-[clamp(1.4rem,2.5vw,1.9rem)] font-bold text-[var(--mbi-text)]">
          {heading}
        </h2>
      )}
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={item.id ?? i} className="rounded-xl border border-[var(--mbi-border)] bg-white p-5">
            <p className="font-semibold text-[var(--mbi-text)]">{item.title}</p>
            {item.description && (
              <p className="mt-1.5 text-sm text-[var(--mbi-text-muted)]">{item.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
