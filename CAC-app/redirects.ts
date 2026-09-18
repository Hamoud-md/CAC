import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const englishProjectsRedirects = [
    {
      source: '/en/projects',
      destination: '/en/projets',
      permanent: true,
    },
    {
      source: '/en/projects/:slug',
      destination: '/en/projets/:slug',
      permanent: true,
    },
  ]

  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  return [...englishProjectsRedirects, internetExplorerRedirect]
}
