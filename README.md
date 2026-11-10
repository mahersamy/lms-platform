# LMS Platform — Backend

A modular monolith LMS (Learning Management System) backend built with **NestJS**, managed as an **Nx + pnpm** monorepo, with **PostgreSQL** and **Redis** (via Docker) and **Drizzle ORM**.

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

### 3. Start local Services (API, PostgreSQL & Redis)

```bash
# Build and start all services (API, PostgreSQL, Redis)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Or start only dependencies (PostgreSQL & Redis)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis

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
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Stop containers AND delete local data permanently
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

> ⚠️ `down -v` permanently removes the named Docker volumes `lms_postgres_data` and `lms_redis_data` and all their data.

---

## Running in Development (Watch / Hot-Reload Mode)

You have two workflows to run in development with hot reload:

### Option A: Fully Containerized in Docker (Recommended if you want everything in Docker)

The development compose overlay (`docker-compose.dev.yml`) mounts your local source files into the container and targets the `dev` stage in [`docker/Dockerfile`](file:///d:/PR/backend/lms-platform/docker/Dockerfile):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
- Edits made on your host machine will be detected automatically and trigger rebuilds inside the container.
- Polling (`WATCHPACK_POLLING=true`) is configured to ensure file changes are reliably caught on Windows.

### Option B: Local Host Process (Fastest for day-to-day coding)

Run PostgreSQL and Redis in Docker, and run NestJS directly on your machine:

```bash
# 1. Start PostgreSQL & Redis
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis

# 2. Run the NestJS API in watch mode
pnpm run start:dev
# or:
pnpm exec nx serve api
```

---

## Production Build

```bash
# Production build locally
pnpm run build
# or:
pnpm exec nx build api
```

The API serves at `http://localhost:3000/api`.

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

> No tables have been defined yet. Run these commands only after adding schema files in
> `libs/infrastructure/database/postgres/schema/`.

---

## Project Structure

```
lms-platform/
├── apps/
│   ├── api/                # NestJS application — composition root only
│   └── api-e2e/            # API end-to-end test project
│
├── libs/
│   ├── shared/
│   │   └── kernel/         # Framework-independent shared abstractions
│   │       ├── domain/
│   │       ├── types/
│   │       └── errors/
│   │
│   ├── infrastructure/     # Technical adapters and integrations
│   │   ├── database/
│   │   │   └── postgres/
│   │   │       └── schema/ # Drizzle table definitions go here
│   │   ├── storage/
│   │   ├── logger/
│   │   ├── encryption/
│   │   └── notifications/
│   │
│   └── features/
│       └── identity/       # Only feature library in this phase
│           ├── domain/       # Business rules — no framework imports
│           ├── application/  # Use cases and ports
│           ├── infrastructure/ # DB repositories, external adapters
│           └── presentation/  # HTTP controllers and DTOs
│
├── tools/
│   └── database/
│       ├── migrations/     # Drizzle-generated SQL migrations
│       ├── seeders/
│       ├── factories/
│       └── scripts/
│
├── docker/                 # Additional Docker configuration files
├── docs/
│   └── architecture/       # Architecture decision records
│
├── .env.example            # Committed template — copy to .env
├── docker-compose.yml      # Base PostgreSQL service definition
├── docker-compose.dev.yml  # Local dev overrides (port binding)
└── drizzle.config.ts       # Drizzle Kit configuration
```

---

## Architecture

This project follows a **Modular Monolith** pattern with four clean-architecture layers per feature:

| Layer | Responsibility | Allowed dependencies |
|-------|---------------|----------------------|
| `domain` | Business rules, entities, value objects | `shared/kernel` only |
| `application` | Use cases, ports (interfaces) | `domain`, `shared/kernel` |
| `infrastructure` | DB repos, external service adapters | `domain`, `application`, `shared/kernel` |
| `presentation` | HTTP controllers, request/response DTOs | `application`, `domain`, `shared/kernel` |

**Module boundaries are enforced by ESLint (`@nx/enforce-module-boundaries`).**

### Adding a new feature

1. Copy the `libs/features/identity/` structure.
2. Rename it to your feature (e.g., `libs/features/courses/`).
3. Add Nx project tags (`scope:<feature>`, `layer:<layer>`) to each library's `project.json`.
4. Register the feature module in `apps/api/src/app/app.module.ts`.

---

## Notes

- **`identity`** is the only feature library created in this initial scaffold.
- The API contains only the NestJS bootstrapped application; no LMS business logic is implemented.
- BullMQ, Nginx, MinIO, and worker processes are out of scope for this phase.
