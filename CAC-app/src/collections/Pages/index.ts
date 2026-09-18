import type { CollectionConfig } from 'payload'
import { createSlugRedirect } from '../../hooks/createSlugRedirect'

import { isStaff } from '../../access/roles'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { Gallery } from '../../blocks/Gallery/config'
import { FeatureList } from '../../blocks/FeatureList/config'
import { hero } from '@/heros/config'
import { localizedSlug } from '../../fields/localizedSlug'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: isStaff,
    delete: isStaff,
    read: authenticatedOrPublished,
    update: isStaff,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Titre',
    },
    {
      name: 'showInNav',
      type: 'checkbox',
      label: 'Afficher au menu',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Afficher dans la navigation secondaire (bas de page / menu secondaire).' },
    },
    {
      name: 'navOrder',
      type: 'number',
      admin: { position: 'sidebar', condition: (_, s) => Boolean(s?.showInNav) },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Bannière',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              localized: true,
              blocks: [Content, MediaBlock, Gallery, FeatureList, CallToAction, FormBlock],
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Contenu',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    localizedSlug('title'),
  ],
  hooks: {
    afterChange: [revalidatePage, createSlugRedirect('')],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
