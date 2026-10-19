# CAC Admin completion — review before production

Production Admin: https://cac.yasserai.net/admin

## Changes

- Header/footer honor the existing SiteSettings logo upload, retaining the verified original CAC logo as fallback. Required footer navigation routes honor their existing localized labels.
- Before deleting Media, Pages, Categories, Services or Projects, check CAC content references across all locales, saved drafts, retained versions, globals and global versions. Refuse referenced deletions with HTTP 409 before Payload deletes files or versions. No references are automatically cleared or reassigned. Unreferenced records remain deletable using existing role permissions.
- Add isolated authenticated regression tests and include them in review CI. No schema changes, migrations, seeds, role changes or production content changes.

## Verification

- 20 targeted tests passed: 13 header/navigation, 2 footer, 4 authenticated Payload integration workflows, 1 nested-reference traversal test.
- Integration tests use a newly created OS temporary SQLite database and media directory, force a local database URL before loading config, and create their own test administrator. They never connect to production. Login/token authentication is real; local API writes explicitly use `overrideAccess: false` with the authenticated user. Anonymous global editing is rejected.
- Homepage and SiteSettings: independent FR/AR/EN saves and reloads. Pages, Services, Categories and Projects: independent locale saves, drafts, publishing and deletion. Media: file replacement retains the record ID and translations. Ads: localized copy, media relationships, active flag and schedule persistence.
- Referenced Media and Categories cannot be deleted; relationships remain intact after rejection. Removing the current media reference still blocks deletion when retained project history refers to it. Deleting the referring test content removes its own versions, after which the unreferenced fixture can be deleted.
- Authenticated browser smoke check against the disposable local database: login/dashboard, all eight Admin editors, Homepage FR/EN/AR saved values, image selectors, Save/Publish controls, Service category relationship selector, Ads active/schedule fields. Browser checks inspect the interface; write/publish/delete assertions run through the authenticated Payload API. No production login or test mutations were performed.
- TypeScript and production build passed. Targeted lint passed with one existing header effect warning; `git diff --check` passed.

## Owner workflow

Configuration → Identité & contact: Contact tab for phone/email/address, Identité for logo/name/tagline, SEO par défaut for default metadata; Navigation secondaire for labels. Contenu → Page d’accueil: hero and section text/images. Pages → a-propos: MBI history in Layout → first content block → first column. Catégories de services #1–8/#11 and Sous-services #25: layout example copy. Projets #23/#26: titles/summaries and galleries. Médiathèque: alt/caption and selected images. Publicités #15/#16/#20: advertiser identity, descriptions and media; keep #18/#19 inactive unless approved. Full exact per-locale inventory remains in `CAC-CMS-branding-audit-20261019.json` in the audit workspace.

Change localized text separately using the locale selector. Phone/email, files and relationship selections are shared where their schema is not localized. Globals/media save immediately; ads use active/schedule; content collections have drafts and publishing. Version history is not an editorial approval mechanism. Referenced assets, including historical references, must be retained; this change deliberately does not add history purging or permission changes. Do not change slugs or relationships merely to replace MBI wording.

## Production safety and release gate

Read-only SSH recheck: CAC remains on image/commit `346ccddf295ed6787a0ca15cc9f7d395cc7a2973`, with dedicated `cac-main_cac_main_media` and `cac-main_cac_main_db_data` volumes. MBI application/database container start times remain unchanged from release evidence. No MBI writes or operations were performed.

Existing evidence: `CAC-production-verification-20261019.json` and `CAC-production-release-20261019.md`. CAC backup container is running and a 19 October scheduled dump is present. Prior dump restore passed in an isolated PostgreSQL container; encrypted offsite backup checksum was verified. Rollback source archive and image `733ff0bacf747c811d42505ac232d51b7108317c` remain available. Full encrypted offsite decryption and deliberate post-switch rollback have not been tested; do not describe these as proven recovery.

Reference traversal tests use SQLite and application hooks. A fresh PostgreSQL concurrency/delete race test was not performed. Guard reads share the delete request/transaction; concurrent creation of new references is not a verified guarantee. Coordinate referenced-content removal rather than relying on simultaneous edit/delete operations. Large version histories increase deletion check cost; traversal uses pages of 100 records and stops on the first reference.

Production deployment remains BLOCKED pending explicit approval of the review commit. Main pushes automatically deploy. Do not merge or dispatch deployment before approval. After approval, follow the existing CAC-only backup/rollback deployment path, then verify live Admin access and FR/AR/EN rendering without editing production CMS data.

Editorial approval and verified CAC contacts, history, project facts, image ownership and promotion details are still required separately. No invented replacement information is included.
