// @vitest-environment node
import type { Field } from 'payload'
import { expect, it } from 'vitest'
import { hasContentReference } from '@/hooks/protectReferencedContent'

it('detects references in localized blocks, arrays, groups, named tabs and Lexical nodes', () => {
  const fields: Field[] = [{ type: 'tabs', tabs: [{ name: 'content', fields: [
    { name: 'layout', type: 'blocks', localized: true, blocks: [{ slug: 'gallery', fields: [
      { name: 'items', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
    ] }] },
    { name: 'copy', type: 'richText' },
    { name: 'settings', type: 'group', fields: [{ name: 'links', type: 'relationship', relationTo: ['pages', 'projects'], hasMany: true }] },
  ] }] }]
  expect(hasContentReference(fields, { content: { layout: { ar: [{ blockType: 'gallery', items: [{ image: 42 }] }] } } }, 'media', 42)).toBe(true)
  expect(hasContentReference(fields, { content: { copy: { root: { children: [{ relationTo: 'media', value: { id: 42 } }] } } } }, 'media', 42)).toBe(true)
  expect(hasContentReference(fields, { content: { settings: { links: [{ relationTo: 'projects', value: 42 }] } } }, 'projects', 42)).toBe(true)
  expect(hasContentReference(fields, { content: { settings: { links: [{ relationTo: 'pages', value: 42 }] } } }, 'projects', 42)).toBe(false)
  expect(hasContentReference(fields, { content: { layout: { en: [{ blockType: 'gallery', items: [{ image: 43 }] }] } } }, 'media', 42)).toBe(false)
})
