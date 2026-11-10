# LMS Platform — Backend

A modular monolith LMS (Learning Management System) backend built with **NestJS 11**, managed as an **Nx + pnpm** monorepo, with **PostgreSQL 18** and **Redis 7** (via Docker) and **Drizzle ORM**.

> **Status:** Initial scaffold only. No business logic has been implemented yet.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 22 LTS |
| pnpm | ≥ 9 |
| Docker Desktop / Docker Engine + Compose | ≥ 24 |

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

`.env.example` is a **committed template** with placeholder values only. Create a local `.env` file from it. Never commit `.env`.

```bash
cp .env.example .env
# Then edit .env with your local values
```

### 3. Start local services (API, PostgreSQL & Redis)

```bash
# Build and start all services (API, PostgreSQL, Redis) in dev/watch mode
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up --build

# Or start only dependencies (PostgreSQL & Redis), run the API locally
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d postgres redis

# Check running containers
docker compose ps

# View service logs
docker compose logs -f api
docker compose logs -f postgres
docker compose logs -f redis
```

### 4. Stop services

```bash
# Stop containers — data is preserved
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml down

# Stop containers AND delete local data permanently
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml down -v
```

> ⚠️ `down -v` permanently removes the named Docker volumes `lms_postgres_data` and `lms_redis_data` and all their data.

---

## Running in Development (Watch / Hot-Reload Mode)

You have two workflows to run in development with hot reload:

### Option A: Fully Containerized in Docker (Recommended)

The development compose overlay (`docker-compose.dev.yaml`) mounts your local source files into the container and targets the `dev` stage in [`docker/Dockerfile`](docker/Dockerfile):

```bash
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up --build
```

- Edits made on your host machine are detected automatically via polling and trigger a rebuild inside the container.
- `WATCHPACK_POLLING=true` and `CHOKIDAR_USEPOLLING=true` are set so file changes are reliably caught on Windows/WSL2.

### Option B: Local Host Process (Fastest for day-to-day coding)

Run PostgreSQL and Redis in Docker, and run NestJS directly on your machine:

```bash
# 1. Start PostgreSQL & Redis only
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d postgres redis

# 2. Run the NestJS API in watch mode
pnpm run start:dev
# or:
pnpm exec nx serve api
```

---

## Production Build

```bash
# Build the production bundle
pnpm run build
# or:
pnpm exec nx build api
```

The API serves at `http://localhost:3000/api`.

```bash
# Run the production image locally
pnpm run start:docker:prod
```

---

## Database Workflow (Drizzle ORM)

```bash
# Generate a new migration from schema changes
pnpm run db:generate

# Apply pending migrations to the database
pnpm run db:migrate

# Open Drizzle Studio (GUI for the database)
pnpm run db:studio

# Push schema directly (dev shortcut, bypasses migration files)
pnpm run db:push
```

> Schema files live inside each feature's `infrastructure/` folder (e.g. `libs/features/identity/src/lib/infrastructure/*.schema.ts`).  
> Drizzle picks them up automatically via the glob `libs/features/**/*.schema.ts` configured in `drizzle.config.ts`.

---

## Project Structure

```
lms-platform/
├── apps/
│   ├── api/                  # NestJS application — composition root only (no business code)
│   └── api-e2e/              # HTTP end-to-end tests
│
├── libs/
│   ├── shared/
│   │   └── kernel/           # (@lms/shared-kernel) Framework-free domain building blocks
│   │       └── src/
│   │           ├── domain/   # Entity, AggregateRoot, ValueObject, DomainEvent, TypedId
│   │           └── common/   # Result, DomainError
│   │
│   ├── infrastructure/       # Technical adapters — one Nx lib each
│   │   ├── config/           # (@lms/infra-config)   tags: type:infra level:base
│   │   ├── database/         # (@lms/infra-database) tags: type:infra level:service
│   │   └── logger/           # (@lms/infra-logger)   tags: type:infra level:base
│   │
│   └── features/             # Business modules — one Nx lib per bounded context
│       └── identity/         # (@lms/identity) tags: type:feature scope:identity
│           └── src/lib/
│               ├── domain/        # Entities, value objects, domain events
│               ├── application/   # Use cases, ports (interfaces)
│               ├── infrastructure/# Repositories, mappers, Drizzle schemas
│               ├── presentation/  # Controllers, request/response DTOs
│               └── identity.module.ts
│
├── tools/
│   └── database/
│       ├── migrations/       # Drizzle-generated SQL migration files
│       ├── seeders/
│       ├── factories/
│       └── scripts/
│
├── docker/                   # Single Dockerfile (multi-stage: base → dev → builder → production)
├── docs/
│   └── architecture/         # Architecture decision records (ADRs)
│
├── .env.example              # Committed template — copy to .env
├── docker-compose.yaml       # Base service definitions (Postgres, Redis, API)
├── docker-compose.dev.yaml   # Dev overrides (port bindings, volume mounts, polling)
└── drizzle.config.ts         # Drizzle Kit configuration
```

---

## Architecture

This project follows a **Modular Monolith** pattern with four clean-architecture layers per feature:

| Layer | Responsibility | May import |
|-------|---------------|------------|
| `domain` | Entities, value objects, domain events, business rules | `@lms/shared-kernel` only |
| `application` | Use cases, port interfaces, DTOs | `domain`, `@lms/shared-kernel` |
| `infrastructure` | DB repositories, mappers, Drizzle schemas, adapters | `application`, `domain`, infra libs |
| `presentation` | HTTP controllers, request/response DTOs, guards | `application`, `domain` types |

**Dependency direction:** `presentation → application → domain` (domain has zero external deps).

### Nx project tags

Every `project.json` carries two or three tags:

| Tag | Values | Meaning |
|-----|--------|---------|
| `type:*` | `app`, `feature`, `infra`, `shared`, `e2e` | What kind of project it is |
| `scope:*` | `identity`, `shared` | Which business domain it belongs to |
| `level:*` | `base`, `service` | Infra only — base libs can't depend on service libs |

**Boundary rules enforced by ESLint `@nx/enforce-module-boundaries`:**

- `type:app` → may depend on `feature`, `infra`, `shared`
- `type:feature` → may depend on `infra`, `shared` (never another feature directly)
- `type:infra` → may depend on `infra`, `shared` (level:service → level:base only)
- `type:shared` → may only depend on `shared`
- `type:e2e` → may only depend on `app`
- `scope:identity` → may only use `scope:identity` or `scope:shared`

Cross-feature communication is done through **domain events** or a public port exported from a feature's `index.ts`. Never import another feature's internals.

### Path aliases

| Alias | Library |
|-------|---------|
| `@lms/identity` | `libs/features/identity` |
| `@lms/infra-config` | `libs/infrastructure/config` |
| `@lms/infra-database` | `libs/infrastructure/database` |
| `@lms/infra-logger` | `libs/infrastructure/logger` |
| `@lms/shared-kernel` | `libs/shared/kernel` |

### Adding a new feature

1. Generate the library: `pnpm exec nx g @nx/nest:library libs/features/<name>`
2. Set tags in `project.json`: `["type:feature", "scope:<name>"]`
3. Create the four layer folders: `domain/`, `application/`, `infrastructure/`, `presentation/`
4. Define `src/index.ts` (public API) **before** writing any code
5. Add schema files inside `src/lib/infrastructure/*.schema.ts`
6. Add a scope rule in `eslint.config.mjs`
7. Add the alias to `tsconfig.base.json`
8. Register the feature module in `apps/api/src/app/app.module.ts`
9. Write an ADR if the feature introduces a cross-feature event or port

---

## Notes

- **PostgreSQL 18** mounts data at `/var/lib/postgresql` (not `/var/lib/postgresql/data`) — this is the correct path for Postgres 18 Alpine images.
- `identity` is the only feature library created in this initial scaffold.
- The API contains only the NestJS bootstrapped application; no LMS business logic is implemented.
- BullMQ, Nginx, MinIO, and worker processes are out of scope for this phase.
