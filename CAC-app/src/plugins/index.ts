import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { getServerSideURL } from '@/utilities/getURL'

export const plugins: Plugin[] = [
  // Auto-create a redirect when a published slug changes (context.md §10, §16).
  redirectsPlugin({
    collections: ['pages', 'service-categories', 'services', 'projects'],
    overrides: {
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  seoPlugin({
    generateTitle: ({ doc }: { doc?: { title?: string } }) =>
      doc?.title ? `${doc.title} | MBI` : 'MBI — Modern Building Industry',
    generateURL: ({ doc }: { doc?: { slug?: string } }) => {
      const url = getServerSideURL()
      return doc?.slug ? `${url}/${doc.slug}` : url
    },
  }),
  // Contact form + submissions (context.md §9.4). Payment fields disabled.
  formBuilderPlugin({
    fields: { payment: false },
    formOverrides: {
      admin: { group: 'Configuration' },
      fields: ({ defaultFields }) =>
        defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  FixedToolbarFeature(),
                  HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                ],
              }),
            }
          }
          return field
        }),
    },
  }),
]
