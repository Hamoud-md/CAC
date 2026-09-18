import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_media_block_ratio" AS ENUM('auto', '21:9', '16:9', '4:3', '1:1', '3:4');
  CREATE TYPE "public"."enum__pages_v_blocks_media_block_ratio" AS ENUM('auto', '21:9', '16:9', '4:3', '1:1', '3:4');
  CREATE TYPE "public"."enum_svc_cat_blocks_media_block_ratio" AS ENUM('auto', '21:9', '16:9', '4:3', '1:1', '3:4');
  CREATE TYPE "public"."enum__svc_cat_v_blocks_media_block_ratio" AS ENUM('auto', '21:9', '16:9', '4:3', '1:1', '3:4');
  CREATE TYPE "public"."enum_services_blocks_media_block_ratio" AS ENUM('auto', '21:9', '16:9', '4:3', '1:1', '3:4');
  CREATE TYPE "public"."enum__services_v_blocks_media_block_ratio" AS ENUM('auto', '21:9', '16:9', '4:3', '1:1', '3:4');
  CREATE TYPE "public"."enum_projects_blocks_media_block_ratio" AS ENUM('auto', '21:9', '16:9', '4:3', '1:1', '3:4');
  CREATE TYPE "public"."enum__projects_v_blocks_media_block_ratio" AS ENUM('auto', '21:9', '16:9', '4:3', '1:1', '3:4');
  CREATE TYPE "public"."enum_homepage_hero_overlay_color" AS ENUM('purple', 'navy', 'black');
  CREATE TYPE "public"."enum__homepage_v_version_hero_overlay_color" AS ENUM('purple', 'navy', 'black');
  ALTER TABLE "homepage" ALTER COLUMN "hero_overlay" SET DEFAULT 66;
  ALTER TABLE "_homepage_v" ALTER COLUMN "version_hero_overlay" SET DEFAULT 66;
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "ratio" "enum_pages_blocks_media_block_ratio" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "caption" varchar;
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "ratio" "enum__pages_v_blocks_media_block_ratio" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "caption" varchar;
  ALTER TABLE "svc_cat_blocks_media_block" ADD COLUMN "ratio" "enum_svc_cat_blocks_media_block_ratio" DEFAULT 'auto';
  ALTER TABLE "svc_cat_blocks_media_block" ADD COLUMN "caption" varchar;
  ALTER TABLE "_svc_cat_v_blocks_media_block" ADD COLUMN "ratio" "enum__svc_cat_v_blocks_media_block_ratio" DEFAULT 'auto';
  ALTER TABLE "_svc_cat_v_blocks_media_block" ADD COLUMN "caption" varchar;
  ALTER TABLE "services_blocks_media_block" ADD COLUMN "ratio" "enum_services_blocks_media_block_ratio" DEFAULT 'auto';
  ALTER TABLE "services_blocks_media_block" ADD COLUMN "caption" varchar;
  ALTER TABLE "_services_v_blocks_media_block" ADD COLUMN "ratio" "enum__services_v_blocks_media_block_ratio" DEFAULT 'auto';
  ALTER TABLE "_services_v_blocks_media_block" ADD COLUMN "caption" varchar;
  ALTER TABLE "projects_blocks_media_block" ADD COLUMN "ratio" "enum_projects_blocks_media_block_ratio" DEFAULT 'auto';
  ALTER TABLE "projects_blocks_media_block" ADD COLUMN "caption" varchar;
  ALTER TABLE "_projects_v_blocks_media_block" ADD COLUMN "ratio" "enum__projects_v_blocks_media_block_ratio" DEFAULT 'auto';
  ALTER TABLE "_projects_v_blocks_media_block" ADD COLUMN "caption" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "ad_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "view_all_label" varchar;
  ALTER TABLE "site_settings_locales" ADD COLUMN "service_cta_default" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_ad_label" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_view_all_label" varchar;
  ALTER TABLE "_site_settings_v_locales" ADD COLUMN "version_service_cta_default" varchar;
  ALTER TABLE "homepage" ADD COLUMN "hero_overlay_enabled" boolean DEFAULT true;
  ALTER TABLE "homepage" ADD COLUMN "hero_overlay_color" "enum_homepage_hero_overlay_color" DEFAULT 'purple';
  ALTER TABLE "homepage_locales" ADD COLUMN "services_eyebrow" varchar DEFAULT 'Nos services';
  ALTER TABLE "homepage_locales" ADD COLUMN "projects_eyebrow" varchar DEFAULT 'Projets phares';
  ALTER TABLE "_homepage_v" ADD COLUMN "version_hero_overlay_enabled" boolean DEFAULT true;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_hero_overlay_color" "enum__homepage_v_version_hero_overlay_color" DEFAULT 'purple';
  ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_services_eyebrow" varchar DEFAULT 'Nos services';
  ALTER TABLE "_homepage_v_locales" ADD COLUMN "version_projects_eyebrow" varchar DEFAULT 'Projets phares';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage" ALTER COLUMN "hero_overlay" SET DEFAULT 70;
  ALTER TABLE "_homepage_v" ALTER COLUMN "version_hero_overlay" SET DEFAULT 70;
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "ratio";
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "caption";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "ratio";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "caption";
  ALTER TABLE "svc_cat_blocks_media_block" DROP COLUMN "ratio";
  ALTER TABLE "svc_cat_blocks_media_block" DROP COLUMN "caption";
  ALTER TABLE "_svc_cat_v_blocks_media_block" DROP COLUMN "ratio";
  ALTER TABLE "_svc_cat_v_blocks_media_block" DROP COLUMN "caption";
  ALTER TABLE "services_blocks_media_block" DROP COLUMN "ratio";
  ALTER TABLE "services_blocks_media_block" DROP COLUMN "caption";
  ALTER TABLE "_services_v_blocks_media_block" DROP COLUMN "ratio";
  ALTER TABLE "_services_v_blocks_media_block" DROP COLUMN "caption";
  ALTER TABLE "projects_blocks_media_block" DROP COLUMN "ratio";
  ALTER TABLE "projects_blocks_media_block" DROP COLUMN "caption";
  ALTER TABLE "_projects_v_blocks_media_block" DROP COLUMN "ratio";
  ALTER TABLE "_projects_v_blocks_media_block" DROP COLUMN "caption";
  ALTER TABLE "site_settings_locales" DROP COLUMN "ad_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "view_all_label";
  ALTER TABLE "site_settings_locales" DROP COLUMN "service_cta_default";
  ALTER TABLE "_site_settings_v_locales" DROP COLUMN "version_ad_label";
  ALTER TABLE "_site_settings_v_locales" DROP COLUMN "version_view_all_label";
  ALTER TABLE "_site_settings_v_locales" DROP COLUMN "version_service_cta_default";
  ALTER TABLE "homepage" DROP COLUMN "hero_overlay_enabled";
  ALTER TABLE "homepage" DROP COLUMN "hero_overlay_color";
  ALTER TABLE "homepage_locales" DROP COLUMN "services_eyebrow";
  ALTER TABLE "homepage_locales" DROP COLUMN "projects_eyebrow";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_hero_overlay_enabled";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_hero_overlay_color";
  ALTER TABLE "_homepage_v_locales" DROP COLUMN "version_services_eyebrow";
  ALTER TABLE "_homepage_v_locales" DROP COLUMN "version_projects_eyebrow";
  DROP TYPE "public"."enum_pages_blocks_media_block_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_media_block_ratio";
  DROP TYPE "public"."enum_svc_cat_blocks_media_block_ratio";
  DROP TYPE "public"."enum__svc_cat_v_blocks_media_block_ratio";
  DROP TYPE "public"."enum_services_blocks_media_block_ratio";
  DROP TYPE "public"."enum__services_v_blocks_media_block_ratio";
  DROP TYPE "public"."enum_projects_blocks_media_block_ratio";
  DROP TYPE "public"."enum__projects_v_blocks_media_block_ratio";
  DROP TYPE "public"."enum_homepage_hero_overlay_color";
  DROP TYPE "public"."enum__homepage_v_version_hero_overlay_color";`)
}
