import type { GlobalConfig } from 'payload'

import { isAdminField, isStaff } from '../../access/roles'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Identité & contact',
  access: {
    read: () => true,
    update: isStaff,
    readVersions: isStaff,
  },
  admin: {
    group: 'Configuration',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contact',
          description: 'Bande de contact en haut du site. Un champ vide est masqué.',
          fields: [
            { name: 'phone', type: 'text', label: 'Téléphone', localized: false },
            { name: 'email', type: 'email', label: 'E-mail', localized: false },
            { name: 'address', type: 'text', label: 'Adresse', localized: true },
          ],
        },
        {
          label: 'Identité',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo CAC',
              admin: { description: 'SVG ou PNG haute résolution. Le ratio est préservé.' },
            },
            {
              name: 'siteName',
              type: 'text',
              localized: true,
              defaultValue: 'CAC — Contemporary Artistic Construction',
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: 'Accroche (pied de page)',
            },
          ],
        },
        {
          label: 'Navigation secondaire',
          fields: [
            {
              name: 'secondaryNav',
              type: 'array',
              label: 'Liens',
              maxRows: 6,
              labels: { singular: 'Lien', plural: 'Liens' },
              fields: [
                { name: 'label', type: 'text', localized: true, required: true },
                { name: 'href', type: 'text', required: true, admin: { description: 'Ex: /projets' } },
              ],
            },
          ],
        },
        {
          label: 'Textes du site',
          description: 'Petits libellés réutilisés à plusieurs endroits.',
          fields: [
            {
              name: 'adLabel',
              type: 'text',
              localized: true,
              label: 'Étiquette au-dessus des publicités',
              admin: { placeholder: 'PUBLICITÉ — laissez vide pour ne rien afficher' },
            },
            {
              name: 'viewAllLabel',
              type: 'text',
              localized: true,
              label: 'Bouton « Tout voir » (menus déroulants)',
              admin: { placeholder: 'Tout voir' },
            },
            {
              name: 'serviceCtaDefault',
              type: 'text',
              localized: true,
              label: 'Texte par défaut du bouton en bas des pages de service',
              admin: { placeholder: 'Discuter de votre projet' },
            },
          ],
        },
        {
          label: 'SEO par défaut',
          fields: [
            { name: 'defaultMetaTitle', type: 'text', localized: true },
            { name: 'defaultMetaDescription', type: 'textarea', localized: true },
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Image de partage par défaut',
            },
            {
              name: 'businessTimezone',
              type: 'text',
              defaultValue: 'Africa/Nouakchott',
              access: { update: isAdminField },
              admin: { description: 'Fuseau horaire pour les dates de publication/planification.' },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  versions: { max: 20 },
}
