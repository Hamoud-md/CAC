# Production database deployment

## Production gallery diagnosis helper

After pulling latest `main`, run this from the deployed repository directory with
the same PostgreSQL connection used by the application and the actual persistent
media directory. Keep credentials out of the repository and logs.

```sh
export DATABASE_URL='...'
export MEDIA_PATH='/actual/persistent/media/path'
bash scripts/production-gallery-diagnostic.sh
```

The helper creates timestamped database and media backups in `./backups` (or
`BACKUP_DIR` if set), prints the read-only gallery-column diagnostic, and stops.
It does not run the fix SQL. Review the output before taking any further action.

## Blank project, sub-service, and service-category lists

The current Payload configuration expects `media_id` in `svc_cat_rels`,
`services_rels`, and `projects_rels`. A PostgreSQL database created before the
gallery field was added can lack these columns; the three admin lists may then
fail. Local SQLite schema synchronization does not prove the PostgreSQL schema
is current.

Run this sequence from the deployed repository directory, using a PostgreSQL
client that can reach the same database as the running application:

1. Confirm that the live application's runtime `DATABASE_URL` points to the
   intended persistent PostgreSQL database. Supply that same URL securely to
   `psql`; do not paste credentials into commands, scripts, or logs. If the
   database is reachable only from Docker, run `psql` in an existing container
   with the same verified connection settings.
2. Back up PostgreSQL and verify that the backup completed. Separately back up
   persistent media storage (the mounted `public/media` directory or its
   configured equivalent). Keep both backups until verification is complete.
3. Run the read-only diagnostic:

   ```sh
   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f scripts/check-content-media-galleries.sql
   ```

   Expect exactly three rows, each marked `PRESENT` or `MISSING`. Stop if the
   query fails, the database identity is uncertain, or a table is absent.
4. If **all three** rows say `PRESENT`, **STOP**. Do not run the fix. Inspect
   application logs for the actual error instead. The column check alone does
   not establish that the full schema is correct.
5. If **one or more** rows say `MISSING`, run **only** this additive fix:

   ```sh
   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f scripts/content-media-galleries.sql
   ```

   Stop if SQL fails. It adds nullable integer columns, foreign keys to
   `media(id)` with `ON DELETE CASCADE`, and indexes inside one transaction.
   Existing rows and media files are untouched.
6. Re-run the diagnostic command. All three rows must now say `PRESENT` with
   `data_type` = `integer` and `is_nullable` = `YES`.
7. Restart or redeploy the app with the existing PostgreSQL connection and
   persistent media mount. Do not remove volumes.
8. In `/admin`, open **service-categories**, **services**, and **projects**.
   Confirm each list loads, its existing entries appear, and an existing entry
   opens. Check a public page using existing images or videos and verify those
   assets still load. Review application logs for errors.

**Do not use** `pnpm seed`, destructive database push, `docker compose down -v`,
`migration down`, or a database reset for this correction. Do not run
`pnpm payload migrate` blindly: a database historically created with
`scripts/db-push.ts` may have no matching migration history, so earlier
migrations could be replayed against existing tables. This procedure applies
only the targeted additive SQL.

## Required production database configuration

The Payload admin panel creates projects, sub-services, and service categories
through the same database connection. Production **must** receive a persistent
PostgreSQL connection at runtime:

```sh
DATABASE_URL=postgresql://<user>:<password>@<database-host>:5432/<database-name>
```

Set this value in the server's runtime environment (for example, its Compose
`environment` / `env_file`), together with `PAYLOAD_SECRET`, before starting the
app container. Do not use `file:./mbi.db` in production: `mbi.db` is intentionally
excluded from the Docker image and SQLite content would not survive a replacement
container. The app now exits on startup when production `DATABASE_URL` is absent
or is not a PostgreSQL URL, preventing unsaved or temporary CMS content.

After configuring the connection, verify it from `/admin` by creating and saving
one project, one sub-service, and one service category; refreshing each list must
show the newly saved item.

This release adds the nullable `media.display_width` and `media.display_height` columns. Existing image files
and descriptions do not need to be changed. Empty widths use the original image
size, constrained by the screen. The width and height settings apply to content images;
hero background images continue to fill their banners.

## Existing PostgreSQL server

1. Back up the database and persistent `public/media` volume using the server's
   usual backup procedure.
2. Pull this commit and build the new Docker image with the existing production
   `NEXT_PUBLIC_SERVER_URL` build argument. Keep the old app running during build.
3. Before switching to the new image, apply the additive SQL to the same database
   used by the app. From `CAC-app`, with `DATABASE_URL` supplied by the server:

   ```sh
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/media-display-size.sql
   ```

   For a database accessible only inside Docker, pass this SQL file to `psql`
   inside the existing database container instead. Stop the deployment if SQL
   fails; a lock timeout can be retried after active transactions finish.

4. Start the new app image with the existing runtime environment and media volume.
   Check a public content page and `/admin`, save a media width such as `300` or
   height such as `500`, and confirm its description and size on desktop and mobile.

The SQL can be repeated and works while the old app is running. Rolling the app
back does not require removing the column; leave it in place to preserve sizes.
Do not run the migration's `down` operation for an ordinary app rollback.

For this gallery-column correction, use the diagnostic and targeted SQL above.
The matching migration is registered after the older migrations, but do not
run the full migration chain unless the production migration history has been
verified against the actual database lifecycle. The adapter currently retains
`push: true` for development compatibility; do not rely on that setting to
apply production changes. Production schema changes must be intentional,
through a verified migration history or targeted additive SQL. Do not use
`scripts/db-push.ts` on production for this correction.

Local SQLite development applies the new field through Payload's development
schema synchronization. This release does not require dependency changes.
