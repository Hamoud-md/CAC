-- Add the gallery relationship columns expected by the current Payload config.
-- This is additive and repeatable: it does not delete media, rows, or files.
BEGIN;

ALTER TABLE "projects_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;
ALTER TABLE "services_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;
ALTER TABLE "svc_cat_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;

DO $$ BEGIN
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk"
    FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_media_fk"
    FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "svc_cat_rels" ADD CONSTRAINT "svc_cat_rels_media_fk"
    FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
CREATE INDEX IF NOT EXISTS "services_rels_media_id_idx" ON "services_rels" USING btree ("media_id");
CREATE INDEX IF NOT EXISTS "svc_cat_rels_media_id_idx" ON "svc_cat_rels" USING btree ("media_id");

COMMIT;
