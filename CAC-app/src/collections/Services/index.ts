import type { CollectionConfig } from 'payload'

import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { isStaff } from '../../access/roles'
import { localizedSlug } from '../../fields/localizedSlug'
import { pageContentTabs } from '../../fields/pageContent'
import { revalidateService, revalidateServiceDelete } from './hooks/revalidateService'

export const Services: CollectionConfig<'services'> = {
  slug: 'services',
  labels: { singular: 'Sous-service', plural: 'Sous-services' },
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
    defaultColumns: ['title', 'category', 'featured', '_status', 'updatedAt'],
    group: 'Contenu',
    listSearchableFields: ['title'],
  },
  orderable: true,
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: 'Titre' },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'service-categories',
      label: 'Catégorie',
      required: true,
      admin: { position: 'sidebar', description: 'Onglet du menu auquel ce sous-service appartient.' },
    },
    {
      type: 'tabs',
      tabs: pageContentTabs(),
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Mettre en avant sur l’accueil',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    localizedSlug('title'),
  ],
  hooks: {
    // ponytail: slug-change redirect skipped here — sub-service URLs are nested
    // under a category the hook can't resolve. Add when editors start renaming live slugs.
    afterChange: [revalidateService],
    afterDelete: [revalidateServiceDelete],
  },
  versions: {
    drafts: { autosave: { interval: 100 }, schedulePublish: true },
    maxPerDoc: 50,
  },
}
