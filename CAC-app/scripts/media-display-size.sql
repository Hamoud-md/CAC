-- Apply to the site's PostgreSQL database before starting the new app image.
-- Additive and safe to repeat; existing media records retain their natural size.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "display_width" numeric;
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "display_height" numeric;
COMMIT;
