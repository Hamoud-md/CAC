/**
 * Force Payload to sync the Postgres schema to the current config (dev-style
 * `push`). Used once to apply a schema change on the server without an
 * interactive `migrate:create`. Run with NODE_ENV unset/development.
 *   docker run --rm -e NODE_ENV=development -e DATABASE_URL=... mbi-v2-app-builder pnpm exec tsx scripts/db-push.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

getPayload({ config })
  .then(() => {
    console.log('schema push complete')
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
