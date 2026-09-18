# MBI — Next.js 16 + Payload 3, standalone output. Built and run on the server.
FROM node:22.17.0-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@11.5.2

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod=false

# ---- builder (also used for one-off `pnpm seed`) ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Payload's config is imported during `next build`; give it non-secret build-time
# values. Real secrets + DATABASE_URL are injected at runtime by compose.
ARG NEXT_PUBLIC_SERVER_URL=https://mbi.yasserai.net
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV PAYLOAD_SECRET=build-only-not-used-at-runtime
ENV NODE_OPTIONS=--no-deprecation
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# ---- runner ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--no-deprecation

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p .next public/media && chown -R nextjs:nodejs .next public/media

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
