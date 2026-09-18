import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: { singular: 'Galerie', plural: 'Galeries' },
  fields: [
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      label: 'Images',
      labels: { singular: 'Image', plural: 'Images' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Image' },
        { name: 'caption', type: 'text', label: 'Légende (optionnel)' },
      ],
    },
  ],
}
