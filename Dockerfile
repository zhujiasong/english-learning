ARG BUN_IMAGE=oven/bun:1
ARG NODE_IMAGE=node:22-slim
ARG NPM_REGISTRY=https://registry.npmjs.org/

FROM ${BUN_IMAGE} AS deps

ARG NPM_REGISTRY

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --registry=${NPM_REGISTRY}

FROM deps AS builder

WORKDIR /app

COPY . .
RUN bun run db:generate
RUN bun run db:setup
RUN bun run build
RUN rm -f .next/standalone/.env .next/standalone/.env.*

FROM ${NODE_IMAGE} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=file:./prisma/dev.db

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
