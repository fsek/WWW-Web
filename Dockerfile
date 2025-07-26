FROM oven/bun 

ARG BUILD_ENV
ARG NEXT_PUBLIC_API_BASE_URL

ENV NODE_ENV=${BUILD_ENV}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

RUN bun run build

RUN cp -r public .next/standalone/ \
 && cp -r .next/static .next/standalone/.next/ \
 && cp -r node_modules .next/standalone/node_modules/

RUN adduser --system --uid 1001 nextjs

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", ".next/standalone/server.js"]
