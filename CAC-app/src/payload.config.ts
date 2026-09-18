import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { fr } from '@payloadcms/translations/languages/fr'
import { ar } from '@payloadcms/translations/languages/ar'
import { en } from '@payloadcms/translations/languages/en'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { ServiceCategories } from './collections/ServiceCategories'
import { Services } from './collections/Services'
import { Projects } from './collections/Projects'
import { Advertisements } from './collections/Advertisements'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings/config'
import { Homepage } from './globals/Homepage/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseURL = process.env.DATABASE_URL || ''
const usesPostgres = databaseURL.startsWith('postgres://') || databaseURL.startsWith('postgresql://')

// A Docker image deliberately does not contain the local SQLite database. Refuse
// to start a production server without Postgres so content is never written to a
// transient file system and lost on a restart or a new deployment.
const isProductionRuntime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build'

if (isProductionRuntime && !usesPostgres) {
  throw new Error(
    'DATABASE_URL must be a postgresql:// URL in production. Configure a persistent PostgreSQL database before starting CAC.',
  )
}

export default buildConfig({
  // Keep this in sync with Next's proxyClientMaxBodySize. Payload's multipart
  // parser otherwise rejects uploads larger than its default 12MB limit.
  bodyParser: {
    limits: { fileSize: 100 * 1024 * 1024 },
  },
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  // Admin interface language — French by default.
  i18n: {
    supportedLanguages: { fr, ar, en },
    fallbackLanguage: 'fr',
  },
  localization: {
    locales: [
      { label: 'Français', code: 'fr' },
      { label: 'العربية', code: 'ar', rtl: true },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'fr',
    fallback: true,
  },
  // Local dev defaults to SQLite (no services to run). Production sets
  // DATABASE_URL to a postgres:// string and gets the Postgres adapter.
  // ponytail: single-file switch; drop SQLite once the server DB is provisioned.
  db: usesPostgres
    ? postgresAdapter({
        pool: { connectionString: databaseURL },
        // Auto-sync schema on boot. Fine for launch; swap to generated
        // migrations (`payload migrate:create`) once the schema settles.
        push: true,
      })
    : sqliteAdapter({
        client: { url: databaseURL || 'file:./mbi.db' },
      }),
  collections: [Pages, ServiceCategories, Services, Projects, Advertisements, Media, Users],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [SiteSettings, Homepage],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
