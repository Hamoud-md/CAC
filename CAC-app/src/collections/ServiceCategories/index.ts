import type { CollectionConfig } from 'payload'

import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { isStaff } from '../../access/roles'
import { localizedSlug } from '../../fields/localizedSlug'
import { pageContentTabs } from '../../fields/pageContent'
import { createSlugRedirect } from '../../hooks/createSlugRedirect'
import { revalidateCategory, revalidateCategoryDelete } from './hooks/revalidateCategory'

export const ServiceCategories: CollectionConfig<'service-categories'> = {
  slug: 'service-categories',
  dbName: 'svc_cat',
  labels: { singular: 'Catégorie', plural: 'Catégories de services' },
  access: {
    create: isStaff,
    delete: isStaff,
    read: authenticatedOrPublished,
    update: isStaff,
  },
  defaultPopulate: { title: true, slug: true, summary: true, coverImage: true, mediaGallery: true },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'showInNav', '_status', 'updatedAt'],
    group: 'Contenu',
    description:
      'Onglets du menu principal. Une catégorie avec des sous-services affiche un menu déroulant ; sans sous-service, l’onglet ouvre directement sa page.',
  },
  orderable: true,
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Titre (onglet du menu)' },
    {
      type: 'tabs',
      tabs: pageContentTabs(),
    },
    {
      name: 'showInNav',
      type: 'checkbox',
      label: 'Afficher au menu',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Afficher cet onglet dans le menu principal.' },
    },
    localizedSlug('title'),
  ],
  hooks: {
    afterChange: [revalidateCategory, createSlugRedirect('services')],
    afterDelete: [revalidateCategoryDelete],
  },
  versions: {
    drafts: { autosave: { interval: 100 }, schedulePublish: true },
    maxPerDoc: 50,
  },
}
