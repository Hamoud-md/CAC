import type { Block } from 'payload'

export const FeatureList: Block = {
  slug: 'featureList',
  interfaceName: 'FeatureListBlock',
  labels: { singular: 'Liste de points', plural: 'Listes de points' },
  fields: [
    { name: 'heading', type: 'text', label: 'Titre de la section' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      label: 'Points',
      labels: { singular: 'Point', plural: 'Points' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Titre' },
        { name: 'description', type: 'textarea', label: 'Description' },
      ],
    },
  ],
}
