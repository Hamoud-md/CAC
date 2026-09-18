import type { CollectionConfig } from 'payload'
import { createSlugRedirect } from '../../hooks/createSlugRedirect'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { isStaff } from '../../access/roles'
import { localizedSlug } from '../../fields/localizedSlug'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { Gallery } from '../../blocks/Gallery/config'
import { FeatureList } from '../../blocks/FeatureList/config'
import { revalidateProject, revalidateProjectDelete } from './hooks/revalidateProject'

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  labels: { singular: 'Projet', plural: 'Projets' },
  access: {
    create: isStaff,
    delete: isStaff,
    read: authenticatedOrPublished,
    update: isStaff,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    summary: true,
    coverImage: true,
    mediaGallery: true,
    category: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'featured', '_status', 'updatedAt'],
    group: 'Contenu',
  },
  orderable: true,
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Titre' },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenu',
          fields: [
            { name: 'summary', type: 'textarea', localized: true },
            { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Image de couverture' },
            {
              name: 'mediaGallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: 'Photos et vidéos',
              admin: {
                description: 'Cliquez sur « Créer un nouveau » puis sélectionnez plusieurs fichiers à la fois (JPG, PNG, WebP, AVIF, MP4 ou WebM). Vérifiez les fichiers importés avant d’enregistrer le projet. Vous pouvez aussi choisir des médias existants.',
              },
            },
            {
              name: 'layout',
              type: 'blocks',
              localized: true,
              label: 'Sections',
              blocks: [Content, MediaBlock, Gallery, FeatureList, CallToAction],
              admin: { initCollapsed: true },
            },
          ],
        },
        {
          label: 'Détails',
          fields: [
            {
              name: 'relatedService',
              type: 'relationship',
              relationTo: 'services',
              label: 'Sous-service associé',
            },
            { name: 'category', type: 'text', localized: true, label: 'Catégorie' },
            { name: 'location', type: 'text', localized: true, label: 'Lieu' },
            { name: 'completedAt', type: 'date', label: 'Date d’achèvement' },
          ],
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
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Afficher dans « Projets phares »',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    localizedSlug('title'),
  ],
  hooks: {
    afterChange: [revalidateProject, createSlugRedirect('projets')],
    afterDelete: [revalidateProjectDelete],
  },
  versions: {
    drafts: { autosave: { interval: 100 }, schedulePublish: true },
    maxPerDoc: 50,
  },
}
