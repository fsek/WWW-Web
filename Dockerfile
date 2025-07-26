# ── Builder stage ───────────────────────────────────────────────────────────────
FROM oven/bun AS builder

ARG BUILD_ENV
ARG NEXT_PUBLIC_API_BASE_URL

ENV NODE_ENV=${BUILD_ENV}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

WORKDIR /app

# 1) Install & build
COPY package.json ./
RUN bun install

COPY . .
RUN bun run build

# 2) Bundle into standalone
RUN cp -r public .next/standalone/ \
 && cp -r .next/static .next/standalone/.next/ \
 && cp -r node_modules .next/standalone/node_modules/

# ── Runner stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Create unprivileged user
RUN addgroup -S nextjs && adduser -S -G nextjs nextjs

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# 3) Copy standalone output into /app
COPY --from=builder /app/.next/standalone ./

# Drop privileges
USER nextjs

EXPOSE 3000

# 4) Run with Node, pointing at server.js in /app
CMD ["node", "server.js"]
