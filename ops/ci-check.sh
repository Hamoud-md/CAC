#!/usr/bin/env bash
set -euo pipefail
corepack enable
cd mbi-app
export DATABASE_URL="postgresql://ci:ci@127.0.0.1:5432/unused"
export PAYLOAD_SECRET="ci-only-not-used-in-production"
export NEXT_PUBLIC_SERVER_URL="https://mbi.yasserai.net"
pnpm install --frozen-lockfile
pnpm run lint
pnpm run build
