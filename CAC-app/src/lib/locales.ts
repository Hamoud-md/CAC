export const LOCALES = ['fr', 'ar', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'
export const RTL_LOCALES: Locale[] = ['ar']

export const isLocale = (v: string | undefined): v is Locale =>
  !!v && (LOCALES as readonly string[]).includes(v)

export const dir = (locale: Locale): 'rtl' | 'ltr' => (RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr')

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  ar: 'العربية',
  en: 'English',
}

export const localeShort: Record<Locale, string> = { fr: 'FR', ar: 'AR', en: 'EN' }

/** UI chrome strings that aren't CMS content. */
export const ui: Record<Locale, Record<string, string>> = {
  fr: {
    discoverServices: 'Découvrir nos services',
    ourServices: 'Nos services',
    advertisement: 'PUBLICITÉ',
    allServices: 'Tous nos services',
    featuredProjects: 'Projets phares',
    viewProject: 'Voir le projet',
    contactUs: 'Nous contacter',
    menu: 'Menu',
  },
  ar: {
    discoverServices: 'اكتشف خدماتنا',
    ourServices: 'خدماتنا',
    advertisement: 'إعلان',
    allServices: 'جميع خدماتنا',
    featuredProjects: 'مشاريع مميزة',
    viewProject: 'عرض المشروع',
    contactUs: 'اتصل بنا',
    menu: 'القائمة',
  },
  en: {
    discoverServices: 'Discover our services',
    ourServices: 'Our services',
    advertisement: 'ADVERTISEMENT',
    allServices: 'All our services',
    featuredProjects: 'Featured projects',
    viewProject: 'View project',
    contactUs: 'Contact us',
    menu: 'Menu',
  },
}
