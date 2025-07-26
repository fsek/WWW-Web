FROM oven/bun AS base

# Allow build-time injection of environment variables
ARG BUILD_ENV
ARG NEXT_PUBLIC_API_BASE_URL

# Set environment for builder & runner
ENV NODE_ENV=${BUILD_ENV}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# ─────────── Dependencies Stage ───────────
FROM base AS deps
WORKDIR /app
# Only package.json is guaranteed to exist
COPY package.json ./

# Run install; this will generate a lockfile in the image
RUN bun install

# Now copy the rest of your source
COPY . .

# ─────────── Builder Stage ───────────
FROM base AS builder
WORKDIR /app
# Bring in installed dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy source
COPY . .
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1
# Build the project (outputs to dist/ and generates css/, chunks/, media/ at root)
RUN bun run build

# ─────────── Runner Stage ───────────
FROM base AS runner
WORKDIR /app
# Create a non-root user
RUN adduser --system --uid 1001 nextjs
# Ensure production mode
ENV NODE_ENV=stage
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=nextjs:bun /app/.next/standalone/ ./

# Run as non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
