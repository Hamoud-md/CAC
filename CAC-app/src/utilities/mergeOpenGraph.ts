import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'CAC — Contemporary Artistic Construction.',
  images: [
    {
      url: `${getServerSideURL()}/og-default.jpg`,
    },
  ],
  siteName: 'CAC',
  title: 'CAC — Contemporary Artistic Construction',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
