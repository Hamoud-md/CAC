import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Advertisements: `desktopImage` / `mobileImage` changed from single upload to
 * `hasMany` (commit f1b80c1 — rotating image/video ads). Payload stores hasMany
 * upload fields in the polymorphic `advertisements_rels` table, so the direct
 * `desktop_image_id` / `mobile_image_id` columns must move to `advertisements_rels`
 * via a new `media_id` column, and the old columns dropped (the surviving
 * `desktop_image_id NOT NULL` constraint otherwise blocks every ad insert).
 *
 * Written to be idempotent: on the running server `push: true` had already added
 * `advertisements_rels.media_id` (and an FK) without a migration record, so each
 * step guards against pre-existing objects. The advertisements table is empty in
 * every environment, but the data-copy step is kept for correctness elsewhere.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "advertisements_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'advertisements_rels'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'media_id'
      ) THEN
        ALTER TABLE "advertisements_rels"
          ADD CONSTRAINT "advertisements_rels_media_fk"
          FOREIGN KEY ("media_id") REFERENCES "public"."media"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "advertisements_rels_media_id_idx"
      ON "advertisements_rels" USING btree ("media_id");

    INSERT INTO "advertisements_rels" ("order", "parent_id", "path", "media_id")
    SELECT 1, "id", 'desktopImage', "desktop_image_id"
    FROM "advertisements"
    WHERE "desktop_image_id" IS NOT NULL;

    INSERT INTO "advertisements_rels" ("order", "parent_id", "path", "media_id")
    SELECT 1, "id", 'mobileImage', "mobile_image_id"
    FROM "advertisements"
    WHERE "mobile_image_id" IS NOT NULL;

    ALTER TABLE "advertisements" DROP COLUMN IF EXISTS "desktop_image_id";
    ALTER TABLE "advertisements" DROP COLUMN IF EXISTS "mobile_image_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "advertisements" ADD COLUMN IF NOT EXISTS "desktop_image_id" integer;
    ALTER TABLE "advertisements" ADD COLUMN IF NOT EXISTS "mobile_image_id" integer;

    UPDATE "advertisements" a SET "desktop_image_id" = r."media_id"
    FROM (
      SELECT DISTINCT ON ("parent_id") "parent_id", "media_id"
      FROM "advertisements_rels"
      WHERE "path" = 'desktopImage'
      ORDER BY "parent_id", "order"
    ) r
    WHERE a."id" = r."parent_id";

    UPDATE "advertisements" a SET "mobile_image_id" = r."media_id"
    FROM (
      SELECT DISTINCT ON ("parent_id") "parent_id", "media_id"
      FROM "advertisements_rels"
      WHERE "path" = 'mobileImage'
      ORDER BY "parent_id", "order"
    ) r
    WHERE a."id" = r."parent_id";

    DELETE FROM "advertisements_rels" WHERE "path" IN ('desktopImage', 'mobileImage');
    DROP INDEX IF EXISTS "advertisements_rels_media_id_idx";
    ALTER TABLE "advertisements_rels" DROP CONSTRAINT IF EXISTS "advertisements_rels_media_fk";
    ALTER TABLE "advertisements_rels" DROP COLUMN IF EXISTS "media_id";
  `)
}
