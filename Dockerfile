# Base image
FROM node:22.17.0-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Only build for production
RUN if [ "$NODE_ENV" = "production" ]; then pnpm run build; fi

# Runner
FROM base AS runner
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

COPY --from=builder /app/node_modules ./node_modules

# Add local binaries to PATH
ENV PATH=/app/node_modules/.bin:$PATH

WORKDIR /app

# Copy public + build output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Only copy standalone for production
RUN if [ "$NODE_ENV" = "production" ] && [ -d /app/.next/standalone ]; then \
      cp -r /app/.next/standalone ./; \
    fi

EXPOSE 3000
ENV PORT=3000

# Dev vs prod command
CMD if [ "$NODE_ENV" = "production" ]; then node server.js; else pnpm dev; fi
