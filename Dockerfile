# ─────────── global base ───────────
FROM oven/bun AS base

# allow build‑time injection
ARG BUILD_ENV
ARG NEXT_PUBLIC_API_BASE_URL

# pick up BUILD_ENV as NODE_ENV in builder & runner
ENV NODE_ENV=${BUILD_ENV}
# make your NEXT_PUBLIC_* visible to Next.js at build time
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# ─────────── deps ───────────
FROM base AS deps
WORKDIR /app
COPY package.json ./
# this will generate bun.lockb + node_modules together
RUN bun install

# ─────────── builder ───────────
FROM base AS builder
WORKDIR /app

# pull in deps
COPY --from=deps /app/node_modules ./node_modules
# bring in everything else
COPY . .

# disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# build into `./dist`
RUN bun run build

# ─────────── runner ───────────
FROM base AS runner
WORKDIR /app

# ensure prod mode
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# non‑root
RUN adduser --system --uid 1001 nextjs

# copy public
COPY --from=builder /app/public ./public

# copy dist output
COPY --from=builder --chown=nextjs:bun /app/dist/standalone ./
COPY --from=builder --chown=nextjs:bun /app/dist/static ./

# give prerender cache perms (now under /app/.next)
RUN mkdir -p /app/.next && chown nextjs:bun /app/.next

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
