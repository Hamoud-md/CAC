/**
 * Phase 1 seed content — hard-coded placeholders for the public shell.
 * Phase 2/3 replace these reads with Payload (SiteSettings global + Services collection).
 * Keep the shapes stable so only the data source changes.
 */

export type Locale = 'fr' | 'ar' | 'en'

export interface MbiContact {
  phone: string
  email: string
  address: string
}

export const mbiContact: MbiContact = {
  // TODO(MBI): confirm these are the real contact details.
  phone: '+222 33 86 85 55',
  email: 'info@mbirim.com',
  address: 'TVZ, Nouakchott, Mauritanie',
}

export interface MbiNavItem {
  label: Record<Locale, string>
  href: string
}

export const mbiSecondaryNav: MbiNavItem[] = [
  { href: '/projets', label: { fr: 'Projets', ar: 'المشاريع', en: 'Projects' } },
  { href: '/a-propos', label: { fr: 'À propos', ar: 'من نحن', en: 'About' } },
  { href: '/contact', label: { fr: 'Contact', ar: 'اتصل بنا', en: 'Contact' } },
]

export interface MbiService {
  slug: string
  name: Record<Locale, string>
}

/** Initial services from the approved French design (context.md §5.3). AR/EN pending real translation. */
export const mbiServices: MbiService[] = [
  {
    slug: 'construction-batiments-prefabriques',
    name: {
      fr: 'Construction et bâtiments préfabriqués',
      ar: 'البناء والمباني الجاهزة',
      en: 'Construction and prefabricated buildings',
    },
  },
  {
    slug: 'unites-equipements-medicaux',
    name: {
      fr: 'Unités et équipements médicaux',
      ar: 'الوحدات والمعدات الطبية',
      en: 'Medical units and equipment',
    },
  },
  {
    slug: 'mobilier-equipements-bureaux',
    name: {
      fr: 'Mobilier et équipements de bureaux',
      ar: 'أثاث ومعدات المكاتب',
      en: 'Office furniture and equipment',
    },
  },
  {
    slug: 'agriculture-irrigation',
    name: { fr: 'Agriculture et irrigation', ar: 'الزراعة والري', en: 'Agriculture and irrigation' },
  },
  {
    slug: 'elevage',
    name: { fr: 'Élevage', ar: 'تربية المواشي', en: 'Livestock' },
  },
  {
    slug: 'securite-protection',
    name: { fr: 'Sécurité et protection', ar: 'الأمن والحماية', en: 'Security and protection' },
  },
  {
    slug: 'grillages-clotures-abris-automobiles',
    name: {
      fr: 'Grillages, clôtures et abris automobiles',
      ar: 'الشباك والأسوار ومظلات السيارات',
      en: 'Fencing, enclosures and car shelters',
    },
  },
  {
    slug: 'transport-logistique',
    name: { fr: 'Transport et logistique', ar: 'النقل واللوجستيك', en: 'Transport and logistics' },
  },
]

export const mbiLocales: { code: Locale; short: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'ar', short: 'AR', dir: 'rtl' },
  { code: 'fr', short: 'FR', dir: 'ltr' },
  { code: 'en', short: 'EN', dir: 'ltr' },
]

export const mbiUi = {
  discoverServices: { fr: 'Découvrir nos services', ar: 'اكتشف خدماتنا', en: 'Discover our services' },
  ourServices: { fr: 'Nos services', ar: 'خدماتنا', en: 'Our services' },
  advertisement: { fr: 'PUBLICITÉ', ar: 'إعلان', en: 'ADVERTISEMENT' },
} as const
