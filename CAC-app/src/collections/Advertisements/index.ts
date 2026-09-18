import type { CollectionConfig } from 'payload'

import { anyone } from '../../access/anyone'
import { isStaff } from '../../access/roles'
import { revalidateAd, revalidateAdDelete } from './hooks/revalidateAd'

export const Advertisements: CollectionConfig<'advertisements'> = {
  slug: 'advertisements',
  labels: { singular: 'Publicité', plural: 'Publicités' },
  access: {
    // Public read is filtered to eligible ads in the query layer (lib/ads.ts).
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'active', 'startAt', 'endAt', 'updatedAt'],
    group: 'Contenu',
  },
  orderable: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom (interne)',
      admin: { description: 'Nom interne, non affiché sur le site.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'desktopImage',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          required: true,
          label: 'Médias (ordinateur)',
          admin: { width: '50%', description: 'Ajoutez une ou plusieurs images ou vidéos. Elles défilent automatiquement sur le site.' },
        },
        {
          name: 'mobileImage',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          label: 'Médias (téléphone)',
          admin: { width: '50%', description: 'Optionnel. Ajoutez une ou plusieurs images ou vidéos optimisées pour mobile.' },
        },
      ],
    },
    {
      name: 'alt',
      type: 'text',
      localized: true,
      required: true,
      label: 'Description de l’image',
      admin: { description: 'Décrit la publicité (pour l’accessibilité et le référencement).' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'destinationUrl',
          type: 'text',
          label: 'Lien de destination',
          admin: { width: '66%', description: 'Optionnel. URL interne (/…) ou externe (https://…).' },
          validate: (val: string | null | undefined) => {
            if (!val) return true
            if (val.startsWith('/')) return true
            try {
              const u = new URL(val)
              return ['http:', 'https:'].includes(u.protocol) || 'URL non valide'
            } catch {
              return 'URL non valide'
            }
          },
        },
        {
          name: 'openIn',
          type: 'select',
          label: 'Ouvrir le lien',
          defaultValue: 'auto',
          admin: { width: '34%' },
          options: [
            { label: 'Automatique', value: 'auto' },
            { label: 'Même onglet', value: 'same' },
            { label: 'Nouvel onglet', value: 'new' },
          ],
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Activée',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Décochez pour retirer la publicité du site.' },
    },
    {
      type: 'row',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'startAt', type: 'date', label: 'Début', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        { name: 'endAt', type: 'date', label: 'Fin', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
    {
      name: 'targeting',
      type: 'group',
      label: 'Ciblage des pages',
      fields: [
        {
          name: 'scope',
          type: 'select',
          label: 'Où l’afficher',
          defaultValue: 'all',
          options: [
            { label: 'Toutes les pages', value: 'all' },
            { label: 'Accueil uniquement', value: 'homepage' },
            { label: 'Services sélectionnés', value: 'services' },
            { label: 'Projets sélectionnés', value: 'projects' },
            { label: 'Pages sélectionnées', value: 'pages' },
          ],
        },
        {
          name: 'services',
          type: 'relationship',
          relationTo: 'services',
          hasMany: true,
          admin: { condition: (_, s) => s?.scope === 'services' },
        },
        {
          name: 'projects',
          type: 'relationship',
          relationTo: 'projects',
          hasMany: true,
          admin: { condition: (_, s) => s?.scope === 'projects' },
        },
        {
          name: 'pages',
          type: 'relationship',
          relationTo: 'pages',
          hasMany: true,
          admin: { condition: (_, s) => s?.scope === 'pages' },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateAd],
    afterDelete: [revalidateAdDelete],
  },
}
