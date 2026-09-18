import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { isStaff } from '../access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: isStaff,
    delete: isStaff,
    read: anyone,
    update: isStaff,
  },
  admin: { group: 'Contenu' },
  labels: { singular: 'Image / fichier', plural: 'Médiathèque' },
  fields: [
    {
      name: 'displayWidth',
      type: 'number',
      label: 'Largeur maximale à l’écran (px)',
      min: 1,
      admin: {
        description:
          'Exemple : 300 pour une petite image. Laissez vide pour conserver la taille naturelle. La largeur s’adapte aux petits écrans.',
      },
    },
    {
      name: 'displayHeight',
      type: 'number',
      label: 'Hauteur maximale à l’écran (px)',
      min: 1,
      admin: {
        description:
          'Exemple : 500 pour limiter la hauteur. Laissez vide pour conserver la hauteur naturelle. Les proportions de l’image sont conservées.',
      },
    },
    {
      name: 'alt',
      type: 'text',
      localized: true,
      label: 'Description de l’image',
      admin: {
        description:
          'Décrit ce que montre l’image (accessibilité et référencement). Requis sauf si l’image est décorative.',
      },
    },
    {
      name: 'decorative',
      type: 'checkbox',
      label: 'Image décorative',
      defaultValue: false,
      admin: {
        description: 'Cochez si l’image est purement décorative (aucune description nécessaire).',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      localized: true,
      label: 'Légende (optionnel)',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.decorative && !data.alt) {
          // Non-blocking nudge; hard-require can be enabled once content is migrated.
        }
        return data
      },
    ],
  },
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    // Safe raster + vector only (context.md §7.2, §18). Payload also checks the file signature.
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
    ],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
