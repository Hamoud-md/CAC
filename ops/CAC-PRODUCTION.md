# CAC production release

The deployment SSH key is scoped by its forced command to receiver project
`cac-main`. The registered repository is `Hamoud-md/CAC`; changing a workflow
environment variable does not change that target. The server copies of
`cac-main-app.py` and the registry entry are installed separately by the owner.

The stable source directory is `/home/bouye/apps/cac-main`. Its protected
`.env.production` and `docker-compose.live.yml` come from the previous running
CAC release; they must not be replaced from the repository or examples.

The server validates CAC's database identity, media volume, networks, loopback
port and production mode before deployment. It builds and replaces **only**
the `app` service, with `--no-deps --no-build --pull never`. Database and backup
containers are left running. No migrations or seeds run. MBI is outside this
project and is never targeted.

Before each deployment the existing backup engine creates an encrypted CAC
backup, uploads it off-server, and checks its downloaded checksum. The CAC
backup paths include the stable source directory and existing media volume.
The deployment engine also saves a local source rollback copy. Rollback restores
that source and starts its already-cached SHA-tagged image; it does not rebuild
the old release or restore the database. Database recovery is a separate process.

On October 19, 2026, the latest scheduled CAC database dump was successfully
restored with `pg_restore --exit-on-error` in a temporary PostgreSQL container
with no network and temporary storage. This verifies that local dump, not an
end-to-end decryption test of the encrypted off-server archive. The temporary
container was removed after the test.

Merge into main triggers the single production workflow after its checks pass.
Do not start a second deployment while that workflow is running. Its public
health checks cover FR, EN and AR. Verify the resulting container image SHA,
the unchanged database/media mounts, and MBI's unchanged image/start time after
release. A source-only rollback cannot undo a database migration, so migrations
require a separate approved release plan.
