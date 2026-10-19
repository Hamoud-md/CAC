#!/usr/bin/env bash
set -euo pipefail
corepack enable
python3 -m unittest discover -s ops/tests -p 'test_*.py'
cd CAC-app
export DATABASE_URL="postgresql://ci:ci@127.0.0.1:5432/unused"
export PAYLOAD_SECRET="ci-only-not-used-in-production"
export NEXT_PUBLIC_SERVER_URL="https://cac.yasserai.net"
pnpm install --frozen-lockfile
pnpm run lint
pnpm exec vitest run --config vitest.config.mts --pool=threads --maxWorkers=1 tests/int/cac-navigation.int.spec.tsx tests/int/cac-navigation-data.int.spec.ts tests/int/ad-sidebar.int.spec.tsx
pnpm run build
