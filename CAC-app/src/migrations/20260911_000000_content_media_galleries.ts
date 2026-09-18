import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const relationTables = ['projects_rels', 'services_rels', 'svc_cat_rels'] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of relationTables) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "media_id" integer;`))
    await db.execute(sql.raw(`
      DO $$ BEGIN
        ALTER TABLE "${table}"
          ADD CONSTRAINT "${table}_media_fk"
          FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `))
    await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS "${table}_media_id_idx" ON "${table}" USING btree ("media_id");`))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of relationTables) {
    await db.execute(sql.raw(`DROP INDEX IF EXISTS "${table}_media_id_idx";`))
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${table}_media_fk";`))
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "media_id";`))
  }
}
