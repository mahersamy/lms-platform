# ─────────────────────────────────────────
# Base Stage
# ─────────────────────────────────────────
FROM node:22-alpine AS base

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable

# Copy dependency manifests first (better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# ─────────────────────────────────────────
# Stage 0: Development (hot-reload via mount)
# ─────────────────────────────────────────
FROM base AS dev

ARG APP=api
ENV APP=${APP}
ENV HOST=0.0.0.0
ENV PORT=3000

# Install dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Source is mounted at runtime — no COPY needed here
EXPOSE 3000

CMD ["nx", "serve", "api"]

# ─────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────
FROM base AS builder

ARG APP=api
ENV APP=${APP}

RUN pnpm install --frozen-lockfile

# Copy source files and build
COPY . .

RUN pnpm exec nx build ${APP}

# ─────────────────────────────────────────
# Stage 2: Production
# ─────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ARG APP=api
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV HOST=0.0.0.0
ENV PORT=3000

RUN corepack enable

# Copy compiled output and pruned dependency manifests from builder stage
COPY --from=builder /app/dist/apps/${APP} ./

# Install production dependencies only
RUN pnpm install --prod --no-frozen-lockfile

USER node

EXPOSE 3000

CMD ["node", "main.js"]

