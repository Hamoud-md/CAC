#!/usr/bin/env bash
set +x
set -euo pipefail
umask 077

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${MEDIA_PATH:?MEDIA_PATH is required}"

case "$DATABASE_URL" in
  postgresql://*|postgres://*) ;;
  *) printf 'DATABASE_URL must be a PostgreSQL URL.\n' >&2; exit 1 ;;
esac

for tool in pg_dump psql tar; do
  command -v "$tool" >/dev/null 2>&1 || {
    printf 'Required command is unavailable: %s\n' "$tool" >&2
    exit 1
  }
done

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
sql_file="$script_dir/check-content-media-galleries.sql"
[[ -f "$sql_file" ]] || { printf 'Diagnostic SQL is missing.\n' >&2; exit 1; }
[[ -d "$MEDIA_PATH" ]] || { printf 'MEDIA_PATH must be an existing directory.\n' >&2; exit 1; }

media_dir="$(cd -- "$MEDIA_PATH" && pwd -P)"
backup_dir="${BACKUP_DIR:-./backups}"
mkdir -p -- "$backup_dir"
backup_dir="$(cd -- "$backup_dir" && pwd -P)"

case "$backup_dir/" in
  "$media_dir/"*)
    printf 'BACKUP_DIR must be outside MEDIA_PATH.\n' >&2
    exit 1
    ;;
esac

printf '=== POSTGRESQL CONNECTION ===\n'
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c \
  'SELECT current_database() AS database, inet_server_addr() AS server_address, inet_server_port() AS server_port;'

timestamp="$(date +%Y%m%d-%H%M%S)"
db_backup="$backup_dir/mbi-db-$timestamp.dump"
media_backup="$backup_dir/mbi-media-$timestamp.tar.gz"
if [[ -e "$db_backup" || -e "$media_backup" ]]; then
  printf 'A backup already exists for this timestamp; retry in a moment.\n' >&2
  exit 1
fi

pg_dump "$DATABASE_URL" -Fc -f "$db_backup"
[[ -s "$db_backup" ]] || { printf 'Database backup is missing or empty.\n' >&2; exit 1; }

tar -czf "$media_backup" -C "$(dirname -- "$media_dir")" -- "$(basename -- "$media_dir")"
[[ -s "$media_backup" ]] || { printf 'Media backup is missing or empty.\n' >&2; exit 1; }

printf '\n=== DATABASE BACKUP ===\n%s\n%s bytes\n' "$db_backup" "$(wc -c < "$db_backup" | tr -d '[:space:]')"
printf '\n=== MEDIA BACKUP ===\n%s\n%s bytes\n' "$media_backup" "$(wc -c < "$media_backup" | tr -d '[:space:]')"
printf '\n=== SCHEMA DIAGNOSTIC ===\n'
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$sql_file"

printf '\nIf all three media_id columns are PRESENT:\n'
printf 'DO NOT run the fix SQL. Inspect application logs.\n\n'
printf 'If one or more are MISSING:\n'
printf 'STOP and send the output for review before running:\n'
printf 'scripts/content-media-galleries.sql\n'
