import type { Tab } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

import { CallToAction } from '../blocks/CallToAction/config'
import { Content } from '../blocks/Content/config'
import { MediaBlock } from '../blocks/MediaBlock/config'
import { Gallery } from '../blocks/Gallery/config'
import { FeatureList } from '../blocks/FeatureList/config'

/** Minimal lexical rich-text from plain paragraphs (for field defaults). */
const rt = (...paras: string[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: paras.map((text) => ({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
    })),
  },
})

/**
 * Example layout every new category / sub-service starts with, so an editor sees
 * the structure and just replaces the placeholder text + adds images.
 */
const exampleLayout = [
  {
    blockType: 'content',
    columns: [
      {
        size: 'full',
        richText: rt(
          'Exemple — remplacez ce texte par la présentation de cette prestation : ce que CAC réalise, pour qui, et ce qui fait la différence.',
          'Ajoutez autant de sections que nécessaire avec le bouton ci-dessous : texte, image (avec choix du cadrage), galerie, liste de points, ou bouton.',
        ),
      },
    ],
  },
  {
    blockType: 'featureList',
    heading: 'Ce que nous apportons',
    items: [
      { title: 'Étude et conseil', description: 'Analyse du besoin et proposition adaptée au budget.' },
      { title: 'Fourniture et installation', description: 'Matériel de qualité, posé par nos équipes.' },
      { title: 'Suivi et maintenance', description: 'Accompagnement après livraison.' },
    ],
  },
]

/**
 * Shared tabbed content used by Service categories and sub-services so every
 * page renders from the same template (client requirement: one template).
 */
export const pageContentTabs = (): Tab[] => [
  {
    label: 'Contenu',
    fields: [
      {
        name: 'summary',
        type: 'textarea',
        localized: true,
        label: 'Description courte',
        admin: {
          description: 'Affichée dans le menu déroulant et sous le titre de la page.',
          placeholder: 'Ex : Réalisation de bâtiments et de hangars, du gros œuvre aux finitions.',
        },
      },
      {
        name: 'coverImage',
        type: 'upload',
        relationTo: 'media',
        label: 'Image de couverture',
        admin: {
          description:
            'Grande image en haut de la page. Dans la médiathèque, cliquez sur l’image pour définir le point central (partie qui reste visible au recadrage).',
        },
      },
      {
        name: 'mediaGallery',
        type: 'upload',
        relationTo: 'media',
        hasMany: true,
        label: 'Photos et vidéos',
        admin: {
          description:
            'Ajoutez une ou plusieurs images ou vidéos (MP4 ou WebM). Elles défilent automatiquement sur la page.',
        },
      },
      {
        name: 'layout',
        type: 'blocks',
        localized: true,
        label: 'Sections',
        blocks: [Content, MediaBlock, Gallery, FeatureList, CallToAction],
        defaultValue: exampleLayout,
        admin: {
          initCollapsed: false,
          description:
            'Sections de la page, dans l’ordre. Le contenu ci-dessous est un exemple : modifiez-le, supprimez-en ou ajoutez-en.',
        },
      },
    ],
  },
  {
    label: 'Bouton d’appel à l’action',
    description: 'Le bouton violet en bas de la page.',
    fields: [
      {
        name: 'ctaLabel',
        type: 'text',
        localized: true,
        label: 'Texte du bouton',
        admin: { placeholder: 'Discuter de votre projet' },
      },
      {
        name: 'ctaHref',
        type: 'text',
        label: 'Lien du bouton',
        admin: { description: 'Ex : /contact — laissez vide pour masquer le bouton.' },
      },
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
]
