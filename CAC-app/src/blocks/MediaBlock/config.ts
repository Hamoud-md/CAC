import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Image',
      admin: {
        description:
          'Dans la médiathèque, cliquez sur l’image pour définir le point central (la partie qui reste visible au recadrage).',
      },
    },
    {
      name: 'ratio',
      type: 'select',
      label: 'Hauteur / cadrage',
      defaultValue: 'auto',
      options: [
        { label: 'Automatique (image entière)', value: 'auto' },
        { label: 'Panoramique 21:9', value: '21:9' },
        { label: 'Large 16:9', value: '16:9' },
        { label: 'Standard 4:3', value: '4:3' },
        { label: 'Carré 1:1', value: '1:1' },
        { label: 'Portrait 3:4', value: '3:4' },
      ],
      admin: {
        description:
          '« Automatique » montre toute l’image. Les autres options fixent la hauteur et recadrent vers le point central.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      label: 'Légende (optionnel)',
    },
  ],
}
