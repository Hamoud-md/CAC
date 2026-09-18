import type { Field } from 'payload'

const LATIN_MARKS = /[̀-ͯ]/g
const NON_SLUG = /[^a-z0-9؀-ۿ]+/g

const slugify = (v: string): string =>
  v
    .normalize('NFD')
    .replace(LATIN_MARKS, '')
    .toLowerCase()
    .replace(NON_SLUG, '-') // keep latin + arabic letters/digits
    .replace(/(^-|-$)/g, '')

/**
 * Localized, per-locale-unique slug. Auto-fills from `sourceField` when left blank,
 * and can be edited manually (context.md §9.1, §10). Uniqueness is per locale.
 */
export const localizedSlug = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  localized: true,
  unique: true,
  required: true,
  admin: {
    position: 'sidebar',
    description: 'URL par langue. Laissé vide, il est généré depuis le titre.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data, siblingData }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source = (data?.[sourceField] ?? siblingData?.[sourceField]) as string | undefined
        return source ? slugify(source) : value
      },
    ],
  },
})
