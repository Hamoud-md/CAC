import type { GlobalConfig } from 'payload'
import { safeRevalidateTag } from '@/utilities/revalidate'

import { isStaff } from '../../access/roles'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Page d’accueil',
  access: { read: () => true, update: isStaff, readVersions: isStaff },
  admin: {
    group: 'Contenu',
    description: 'Tous les textes, images et réglages de la page d’accueil.',
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Section héro (grand bloc en haut)',
      fields: [
        {
          name: 'heroEyebrow',
          type: 'text',
          localized: true,
          label: 'Sur-titre',
          defaultValue: 'Modern Building Industry',
          admin: { placeholder: 'Ex : Modern Building Industry' },
        },
        {
          name: 'heroHeading',
          type: 'text',
          localized: true,
          required: true,
          label: 'Titre principal',
          defaultValue: 'Des structures qui font avancer vos ambitions',
        },
        {
          name: 'heroParagraph',
          type: 'textarea',
          localized: true,
          label: 'Paragraphe',
          admin: { placeholder: 'Une ou deux phrases qui présentent MBI.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'heroCtaLabel',
              type: 'text',
              localized: true,
              label: 'Texte du bouton',
              admin: { width: '50%', placeholder: 'Ex : Découvrir nos services' },
            },
            {
              name: 'heroCtaHref',
              type: 'text',
              label: 'Lien du bouton',
              defaultValue: '#services',
              admin: {
                width: '50%',
                description: '#services pour descendre à la liste, ou /contact, /projets…',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Image de fond',
              admin: {
                width: '50%',
                description:
                  'Dans la médiathèque, cliquez sur l’image pour choisir le point central (quelle partie reste visible).',
              },
            },
            {
              name: 'heroImageMobile',
              type: 'upload',
              relationTo: 'media',
              label: 'Image de fond — mobile (optionnel)',
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'heroOverlayEnabled',
          type: 'checkbox',
          label: 'Afficher le voile de couleur par-dessus l’image',
          defaultValue: true,
          admin: { description: 'Décochez pour montrer l’image sans voile.' },
        },
        {
          type: 'row',
          admin: { condition: (_, s) => s?.heroOverlayEnabled !== false },
          fields: [
            {
              name: 'heroOverlayColor',
              type: 'select',
              label: 'Couleur du voile',
              defaultValue: 'purple',
              options: [
                { label: 'Violet MBI', value: 'purple' },
                { label: 'Bleu nuit', value: 'navy' },
                { label: 'Noir', value: 'black' },
              ],
              admin: { width: '50%' },
            },
            {
              name: 'heroOverlay',
              type: 'number',
              label: 'Intensité du voile (%)',
              min: 0,
              max: 95,
              defaultValue: 66,
              admin: { width: '50%', step: 1 },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Section « Nos services »',
      fields: [
        {
          name: 'servicesEyebrow',
          type: 'text',
          localized: true,
          label: 'Sur-titre',
          defaultValue: 'Nos services',
        },
        {
          name: 'servicesHeading',
          type: 'text',
          localized: true,
          label: 'Titre',
          defaultValue: 'Des solutions complètes pour vos projets',
        },
        { name: 'servicesIntro', type: 'textarea', localized: true, label: 'Introduction' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Section « Projets »',
      fields: [
        {
          name: 'projectsEyebrow',
          type: 'text',
          localized: true,
          label: 'Sur-titre',
          defaultValue: 'Projets phares',
        },
        {
          name: 'projectsHeading',
          type: 'text',
          localized: true,
          label: 'Titre',
          defaultValue: 'Projets phares',
        },
        { name: 'projectsIntro', type: 'textarea', localized: true, label: 'Introduction' },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ req: { context } }) => {
        if (!context.disableRevalidate) safeRevalidateTag('homepage')
      },
    ],
  },
  versions: { max: 20 },
}
