import { headers } from 'next/headers'

import type { PageContext } from './ads'
import { LOCALES } from './locales'

/** Derive the ad targeting context from the request path (set by proxy.ts). */
export async function pageContextFromHeaders(): Promise<PageContext> {
  const h = await headers()
  const path = h.get('x-mbi-path') ?? ''
  const parts = path.split('/').filter(Boolean) // ['fr', 'services', 'elevage']
  if (parts.length > 0 && LOCALES.includes(parts[0] as (typeof LOCALES)[number])) parts.shift()

  if (parts.length === 0) return { type: 'homepage' }
  const [first, second, third] = parts
  if (first === 'services' && (third || second))
    return { type: 'service', slug: decodeURIComponent(third || second) }
  if (first === 'projets' && second) return { type: 'project', slug: decodeURIComponent(second) }
  if (first === 'projets') return { type: 'all' }
  if (first) return { type: 'page', slug: decodeURIComponent(first) }
  return { type: 'all' }
}
