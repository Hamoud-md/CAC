/**
 * Idempotent dev seed: admin user, SiteSettings, Homepage, and the 8 initial services.
 * Run: pnpm seed
 */
import 'dotenv/config'
import path from 'path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const asset = (f: string) => path.resolve(process.cwd(), 'scripts/assets', f)
const pub = (f: string) => path.resolve(process.cwd(), 'public/images', f)

/** Minimal lexical rich-text document from plain paragraphs. */
const rt = (...paras: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paras.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
    })),
  },
})

type L = { fr: string; ar: string; en: string }
type Sub = { slug: string; title: L }
type Cat = { slug: string; title: L; sumFr: string; img?: string; subs: Sub[] }

// 11 categories from MBI's brief. AR/EN are best-effort; editable in the dashboard.
const categories: Cat[] = [
  {
    slug: 'prefabrique',
    title: { fr: 'Préfabriqué', ar: 'الجاهز', en: 'Prefabricated' },
    sumFr: 'Solutions préfabriquées en panneaux sandwich et ciment-fibre, livrées et montées rapidement.',
    img: 'construction.webp',
    subs: [
      { slug: 'panneaux-sandwich', title: { fr: 'Panneaux sandwich', ar: 'الألواح السندويتش', en: 'Sandwich panels' } },
      { slug: 'ciment-fibre', title: { fr: 'Ciment-fibre', ar: 'الأسمنت الليفي', en: 'Fibre-cement' } },
    ],
  },
  {
    slug: 'construction',
    title: { fr: 'Construction', ar: 'البناء', en: 'Construction' },
    sumFr: 'Réalisation de bâtiments et de hangars, du gros œuvre aux finitions.',
    img: 'construction.webp',
    subs: [
      { slug: 'batiment', title: { fr: 'Bâtiment', ar: 'المباني', en: 'Buildings' } },
      { slug: 'hangars', title: { fr: 'Hangars', ar: 'الحظائر', en: 'Warehouses' } },
    ],
  },
  {
    slug: 'etudes-et-suivi',
    title: { fr: 'Études et suivi', ar: 'الدراسات والمتابعة', en: 'Studies & supervision' },
    sumFr: 'Ingénierie et suivi de projet, de la faisabilité à la réception des ouvrages.',
    subs: [
      { slug: 'ingenierie', title: { fr: 'Ingénierie', ar: 'الهندسة', en: 'Engineering' } },
      { slug: 'gestion-de-projet', title: { fr: 'Gestion de projet', ar: 'إدارة المشاريع', en: 'Project management' } },
    ],
  },
  {
    slug: 'architectes-et-designers',
    title: { fr: 'Architectes et designers', ar: 'المهندسون المعماريون والمصممون', en: 'Architects & designers' },
    sumFr: 'Conception architecturale et plans d’exécution pour vos projets.',
    subs: [
      { slug: 'conception', title: { fr: 'Conception', ar: 'التصميم', en: 'Design' } },
      { slug: 'plans', title: { fr: 'Plans', ar: 'المخططات', en: 'Drawings' } },
    ],
  },
  {
    slug: 'reseaux-electriques-et-eau',
    title: { fr: 'Réseaux électriques et eau', ar: 'الشبكات الكهربائية والمياه', en: 'Electrical & water networks' },
    sumFr: 'Plomberie, distribution d’eau et installations électriques courants forts et faibles.',
    img: 'safety.webp',
    subs: [
      { slug: 'plomberie-et-distribution', title: { fr: 'Plomberie et distribution', ar: 'السباكة والتوزيع', en: 'Plumbing & distribution' } },
      { slug: 'courants-forts-et-faibles', title: { fr: 'Courants forts et faibles', ar: 'التيارات القوية والضعيفة', en: 'Power & low-voltage' } },
    ],
  },
  {
    slug: 'energie-solaire',
    title: { fr: 'Énergie solaire', ar: 'الطاقة الشمسية', en: 'Solar energy' },
    sumFr: 'Installation de systèmes solaires et solutions d’énergie renouvelable.',
    img: 'agriculture.webp',
    subs: [
      { slug: 'installation', title: { fr: 'Installation', ar: 'التركيب', en: 'Installation' } },
      { slug: 'energie-renouvelable', title: { fr: 'Énergie renouvelable', ar: 'الطاقة المتجددة', en: 'Renewable energy' } },
    ],
  },
  {
    slug: 'agriculture',
    title: { fr: 'Agriculture', ar: 'الزراعة', en: 'Agriculture' },
    sumFr: 'Aménagement agricole et conduite de projets, de l’irrigation aux équipements.',
    img: 'agriculture.webp',
    subs: [
      { slug: 'amenagement', title: { fr: 'Aménagement', ar: 'التهيئة', en: 'Development' } },
      { slug: 'projet-agricole', title: { fr: 'Projet agricole', ar: 'مشروع زراعي', en: 'Agricultural project' } },
    ],
  },
  {
    slug: 'elevage',
    title: { fr: 'Élevage', ar: 'تربية المواشي', en: 'Livestock' },
    sumFr: 'Infrastructures et équipements d’élevage pour le bien-être animal et la productivité.',
    img: 'livestock.webp',
    subs: [
      { slug: 'infrastructure', title: { fr: 'Infrastructure', ar: 'البنية التحتية', en: 'Infrastructure' } },
      { slug: 'equipement-elevage', title: { fr: 'Équipement', ar: 'المعدات', en: 'Equipment' } },
    ],
  },
  {
    slug: 'execution-de-forage',
    title: { fr: 'Exécution de forage', ar: 'تنفيذ الآبار', en: 'Borehole drilling' },
    sumFr: 'Réalisation de forages et de puits, étude hydrogéologique et équipement.',
    subs: [],
  },
  {
    slug: 'materiels-de-sante-equipements-medicaux',
    title: { fr: 'Matériels de santé et équipements médicaux', ar: 'المستلزمات والمعدات الطبية', en: 'Health & medical equipment' },
    sumFr: 'Unités de soins et équipements médicaux, fournis et installés selon les normes.',
    img: 'medical-units.webp',
    subs: [],
  },
  {
    slug: 'equipements-de-bureaux',
    title: { fr: 'Équipements de bureaux', ar: 'تجهيزات المكاتب', en: 'Office equipment' },
    sumFr: 'Mobilier et matériel informatique pour aménager des espaces de travail performants.',
    img: 'office-equipment.webp',
    subs: [
      { slug: 'mobilier', title: { fr: 'Mobilier', ar: 'الأثاث', en: 'Furniture' } },
      { slug: 'informatique', title: { fr: 'Informatique', ar: 'المعلوماتية', en: 'IT equipment' } },
    ],
  },
]

const featureBlockFr = {
  blockType: 'featureList' as const,
  heading: 'Ce que nous apportons',
  items: [
    { title: 'Étude et conseil', description: 'Analyse de vos besoins et proposition d’une solution adaptée à votre budget.' },
    { title: 'Fourniture et installation', description: 'Matériel de qualité, installé par nos équipes dans les délais convenus.' },
    { title: 'Suivi et maintenance', description: 'Accompagnement après livraison pour garantir la durabilité de l’installation.' },
  ],
}

async function run() {
  const payload = await getPayload({ config })

  // Safety: this seed WIPES all content collections. Refuse if content already
  // exists unless SEED_FORCE=1 — so a stray `pnpm seed` in production is a no-op.
  const existingCats = await payload.count({ collection: 'service-categories' })
  if (existingCats.totalDocs > 0 && process.env.SEED_FORCE !== '1') {
    payload.logger.warn(
      `Refusing to seed: ${existingCats.totalDocs} categories already exist. Set SEED_FORCE=1 to wipe and reseed.`,
    )
    process.exit(0)
  }

  const uploadImg = async (filePath: string, alt: string): Promise<number | string> => {
    const m = await payload.create({
      collection: 'media',
      context: { disableRevalidate: true },
      filePath,
      data: { alt },
    })
    return m.id
  }

  // 0. Clean slate for content collections (dev seed only — keeps users).
  for (const collection of ['services', 'service-categories', 'projects', 'advertisements', 'pages', 'forms', 'media'] as const) {
    await payload.delete({
      collection,
      where: { id: { exists: true } },
      context: { disableRevalidate: true },
    })
  }
  payload.logger.info('Cleared content collections')

  // 1. Admin user
  const existing = await payload.find({ collection: 'users', limit: 1, where: { email: { equals: 'admin@mbirim.com' } } })
  if (existing.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { name: 'MBI Admin', email: 'admin@mbirim.com', password: 'mbi-admin-2026', role: 'admin' },
    })
    payload.logger.info('Created admin user admin@mbirim.com / mbi-admin-2026')
  }

  // 2. SiteSettings — seed fr first (creates array rows + ids), then reuse the
  //    row ids so localized labels line up across locales.
  const navLabels = {
    fr: ['Projets', 'À propos', 'Contact'],
    ar: ['المشاريع', 'من نحن', 'اتصل بنا'],
    en: ['Projects', 'About', 'Contact'],
  }
  const navHrefs = ['/projets', '/a-propos', '/contact']

  const savedFr = await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'fr',
    context: { disableRevalidate: true },
    data: {
      phone: '+222 33 86 85 55',
      email: 'info@mbirim.com',
      address: 'TVZ, Nouakchott, Mauritanie',
      siteName: 'MBI — Modern Building Industry',
      tagline:
        'Solutions durables en construction, équipements et services — Nouakchott, Mauritanie.',
      secondaryNav: navHrefs.map((href, i) => ({ href, label: navLabels.fr[i] })),
      defaultMetaTitle: 'MBI — Modern Building Industry',
      defaultMetaDescription:
        'MBI conçoit et réalise des solutions durables dans la construction, les équipements et les services en Mauritanie.',
    },
  })
  const rowIds = (savedFr.secondaryNav ?? []).map((r) => r.id)

  for (const loc of ['ar', 'en'] as const) {
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: loc,
      context: { disableRevalidate: true },
      data: {
        siteName: loc === 'ar' ? 'MBI' : 'MBI — Modern Building Industry',
        address:
          loc === 'ar'
            ? 'المنطقة الحرة تجكجة، نواكشوط، موريتانيا'
            : 'TVZ, Nouakchott, Mauritania',
        tagline:
          loc === 'ar'
            ? 'حلول مستدامة في البناء والتجهيزات والخدمات — نواكشوط، موريتانيا.'
            : 'Durable solutions in construction, equipment and services — Nouakchott, Mauritania.',
        secondaryNav: navHrefs.map((href, i) => ({ id: rowIds[i], href, label: navLabels[loc][i] })),
      },
    })
  }
  payload.logger.info('Updated SiteSettings')

  // 3. Homepage
  const heroImageId = await uploadImg(pub('landingpage.jpeg'), 'Projet architectural signé MBI')
  await payload.updateGlobal({
    slug: 'homepage',
    locale: 'fr',
    context: { disableRevalidate: true },
    data: {
      heroEyebrow: 'Modern Building Industry',
      heroHeading: 'Des structures qui font avancer vos ambitions',
      heroParagraph:
        'MBI conçoit et réalise des solutions durables et innovantes dans la construction, les équipements et les services pour accompagner le développement de vos projets.',
      heroCtaLabel: 'Découvrir nos services',
      heroCtaHref: '#services',
      heroImage: heroImageId,
      heroOverlayEnabled: true,
      heroOverlayColor: "purple",
      heroOverlay: 66,
      servicesHeading: 'Des solutions complètes pour vos projets',
      servicesIntro:
        'MBI met son expertise et ses moyens au service de vos ambitions avec des solutions adaptées à chaque secteur d’activité.',
      projectsHeading: 'Projets phares',
    },
  })
  await payload.updateGlobal({ slug: 'homepage', locale: 'en', context: { disableRevalidate: true }, data: {
    heroEyebrow: 'Modern Building Industry',
    heroHeading: 'Structures that move your ambitions forward',
    heroParagraph: 'MBI designs and delivers durable, innovative solutions in construction, equipment and services to support your projects.',
    heroCtaLabel: 'Discover our services',
    servicesHeading: 'Complete solutions for your projects',
    servicesIntro: 'MBI puts its expertise and resources at the service of your ambitions with solutions tailored to every sector.',
    projectsHeading: 'Featured projects',
  } })
  await payload.updateGlobal({ slug: 'homepage', locale: 'ar', context: { disableRevalidate: true }, data: {
    heroEyebrow: 'Modern Building Industry',
    heroHeading: 'هياكل تدفع طموحاتك إلى الأمام',
    heroParagraph: 'تصمم MBI وتنفذ حلولاً مستدامة ومبتكرة في البناء والتجهيزات والخدمات لمواكبة تطور مشاريعك.',
    heroCtaLabel: 'اكتشف خدماتنا',
    servicesHeading: 'حلول متكاملة لمشاريعك',
    servicesIntro: 'تضع MBI خبرتها ومواردها في خدمة طموحاتك بحلول مصممة لكل قطاع نشاط.',
    projectsHeading: 'مشاريع مميزة',
  } })
  payload.logger.info('Updated Homepage')

  // 4. Service categories + sub-services
  let subCount = 0
  for (const cat of categories) {
    const coverId = cat.img
      ? await uploadImg(pub(`services/${cat.img}`), `${cat.title.fr} — MBI`)
      : undefined
    const catFr = await payload.create({
      collection: 'service-categories',
      locale: 'fr',
      context: { disableRevalidate: true },
      data: {
        slug: cat.slug,
        _status: 'published',
        showInNav: true,
        title: cat.title.fr,
        summary: cat.sumFr,
        ctaLabel: 'Discuter de votre projet',
        ctaHref: '/contact',
        // A category with no sub-services gets its own content page.
        ...(cat.subs.length === 0 ? { layout: [featureBlockFr] as never } : {}),
        ...(coverId ? { coverImage: coverId } : {}),
      },
    })
    await payload.update({ collection: 'service-categories', id: catFr.id, locale: 'ar', context: { disableRevalidate: true }, data: { title: cat.title.ar, slug: cat.slug } })
    await payload.update({ collection: 'service-categories', id: catFr.id, locale: 'en', context: { disableRevalidate: true }, data: { title: cat.title.en, slug: cat.slug } })

    for (const sub of cat.subs) {
      const subFr = await payload.create({
        collection: 'services',
        locale: 'fr',
        context: { disableRevalidate: true },
        data: {
          slug: sub.slug,
          _status: 'published',
          category: catFr.id,
          title: sub.title.fr,
          summary: cat.sumFr,
          ctaLabel: 'Discuter de votre projet',
          ctaHref: '/contact',
          layout: [featureBlockFr] as never,
          ...(coverId ? { coverImage: coverId } : {}),
        },
      })
      await payload.update({ collection: 'services', id: subFr.id, locale: 'ar', context: { disableRevalidate: true }, data: { title: sub.title.ar, slug: sub.slug } })
      await payload.update({ collection: 'services', id: subFr.id, locale: 'en', context: { disableRevalidate: true }, data: { title: sub.title.en, slug: sub.slug } })
      subCount++
    }
  }
  payload.logger.info(`Seeded ${categories.length} categories + ${subCount} sub-services`)

  // 5. House advertisements (placeholder creatives until MBI supplies real ones)
  const adsCount = await payload.count({ collection: 'advertisements' })
  if (adsCount.totalDocs === 0) {
    const m1 = await payload.create({
      collection: 'media',
      context: { disableRevalidate: true },
      filePath: asset('ad-house-1.png'),
      data: { alt: 'Publicité MBI', decorative: false },
    })
    const m1m = await payload.create({
      collection: 'media',
      context: { disableRevalidate: true },
      filePath: asset('ad-house-1-mobile.png'),
      data: { alt: 'Publicité MBI', decorative: false },
    })
    const m2 = await payload.create({
      collection: 'media',
      context: { disableRevalidate: true },
      filePath: asset('ad-house-2.png'),
      data: { alt: 'Équipez vos espaces avec MBI', decorative: false },
    })
    await payload.create({
      collection: 'advertisements',
      context: { disableRevalidate: true },
      data: {
        name: 'Maison — MBI (haut de rail)',
        desktopImage: m1.id,
        mobileImage: m1m.id,
        alt: 'MBI — solutions de construction',
        destinationUrl: '/contact',
        openIn: 'auto',
        active: true,
        targeting: { scope: 'all' },
      },
    })
    await payload.create({
      collection: 'advertisements',
      context: { disableRevalidate: true },
      data: {
        name: 'Maison — Équipements',
        desktopImage: m2.id,
        alt: 'Équipez vos espaces avec des solutions de qualité',
        destinationUrl: '/services/mobilier-equipements-bureaux',
        openIn: 'auto',
        active: true,
        targeting: { scope: 'all' },
      },
    })
    payload.logger.info('Seeded 2 house advertisements')
  }

  // 6. Contact form + About / Contact pages
  let formId: number | string | undefined
  const forms = await payload.find({ collection: 'forms', limit: 1, where: { title: { equals: 'Formulaire de contact' } } })
  if (forms.totalDocs > 0) {
    formId = forms.docs[0].id
  } else {
    const form = await payload.create({
      collection: 'forms',
      context: { disableRevalidate: true },
      data: {
        title: 'Formulaire de contact',
        submitButtonLabel: 'Envoyer',
        confirmationType: 'message',
        confirmationMessage: rt('Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.'),
        fields: [
          { blockType: 'text', name: 'nom', label: 'Nom', required: true, width: 100 },
          { blockType: 'email', name: 'email', label: 'E-mail', required: true, width: 100 },
          { blockType: 'text', name: 'sujet', label: 'Sujet', required: false, width: 100 },
          { blockType: 'textarea', name: 'message', label: 'Message', required: true, width: 100 },
        ],
      },
    })
    formId = form.id
  }

  const pages: { slug: string; title: Record<'fr' | 'ar' | 'en', string>; layout: unknown[] }[] = [
    {
      slug: 'a-propos',
      title: { fr: 'À propos', ar: 'من نحن', en: 'About' },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: rt(
                'Modern Building Industry (MBI) est une entreprise mauritanienne fondée en 2009. Véritable pionnière en Mauritanie dans le secteur des préfabriqués — notamment grâce à ses solutions en panneaux sandwich et ciment-fibre —, elle déploie une offre globale et multisectorielle.',
                'En s’appuyant sur des matières premières issues des plus grandes entreprises turques et européennes, et en alliant une solide expertise en ingénierie, en architecture et en construction à une maîtrise pointue des infrastructures techniques, énergétiques, agricoles et industrielles, MBI s’impose comme le partenaire de référence pour la réalisation de projets complexes, de la conception architecturale jusqu’à l’équipement complet des ouvrages.',
              ),
            },
          ],
        },
      ],
    },
    {
      slug: 'contact',
      title: { fr: 'Contact', ar: 'اتصل بنا', en: 'Contact' },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: rt('Contactez-nous via le formulaire ci-dessous ou aux coordonnées indiquées en haut de page.'),
            },
          ],
        },
        { blockType: 'formBlock', form: formId, enableIntro: false },
      ],
    },
  ]

  for (const pg of pages) {
    const found = await payload.find({ collection: 'pages', locale: 'fr', limit: 1, where: { slug: { equals: pg.slug } } })
    const data = { slug: pg.slug, _status: 'published' as const, showInNav: true, title: pg.title.fr, layout: pg.layout as never }
    let id: number | string
    if (found.totalDocs > 0) {
      id = found.docs[0].id
      await payload.update({ collection: 'pages', id, locale: 'fr', context: { disableRevalidate: true }, data })
    } else {
      const created = await payload.create({ collection: 'pages', locale: 'fr', context: { disableRevalidate: true }, data })
      id = created.id
    }
    await payload.update({ collection: 'pages', id, locale: 'ar', context: { disableRevalidate: true }, data: { title: pg.title.ar, slug: pg.slug } })
    await payload.update({ collection: 'pages', id, locale: 'en', context: { disableRevalidate: true }, data: { title: pg.title.en, slug: pg.slug } })
  }
  payload.logger.info('Seeded contact form + About/Contact pages')

  payload.logger.info('Seed complete.')
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
