import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'MBI — Modern Building Industry, Nouakchott, Mauritanie.',
  images: [
    {
      url: `${getServerSideURL()}/og-default.jpg`,
    },
  ],
  siteName: 'MBI',
  title: 'MBI — Modern Building Industry',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
