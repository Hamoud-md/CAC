import * as migration_20260903_144252_initial from './20260903_144252_initial';
import * as migration_20260903_203013_v2_editability from './20260903_203013_v2_editability';
import * as migration_20260907_220000_media_display_width from './20260907_220000_media_display_width';
import * as migration_20260909_120000_ads_multi_media from './20260909_120000_ads_multi_media';
import * as migration_20260910_223000_media_display_height from './20260910_223000_media_display_height';
import * as migration_20260911_000000_content_media_galleries from './20260911_000000_content_media_galleries';

export const migrations = [
  // Keep migrations ordered by creation date.
  {
    up: migration_20260903_144252_initial.up,
    down: migration_20260903_144252_initial.down,
    name: '20260903_144252_initial',
  },
  {
    up: migration_20260903_203013_v2_editability.up,
    down: migration_20260903_203013_v2_editability.down,
    name: '20260903_203013_v2_editability'
  },
  {
    up: migration_20260907_220000_media_display_width.up,
    down: migration_20260907_220000_media_display_width.down,
    name: '20260907_220000_media_display_width',
  },
  {
    up: migration_20260909_120000_ads_multi_media.up,
    down: migration_20260909_120000_ads_multi_media.down,
    name: '20260909_120000_ads_multi_media',
  },
  {
    up: migration_20260910_223000_media_display_height.up,
    down: migration_20260910_223000_media_display_height.down,
    name: '20260910_223000_media_display_height',
  },
  {
    up: migration_20260911_000000_content_media_galleries.up,
    down: migration_20260911_000000_content_media_galleries.down,
    name: '20260911_000000_content_media_galleries',
  },
];
