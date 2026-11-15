# Architecture Overview

This document describes the top-level structure of the LMS Platform backend.

## Style

**Modular Monolith** using Clean Architecture layers within each feature lib.  
Stack: Nx 24 · NestJS 11 · pnpm · Drizzle ORM · PostgreSQL 18 · Redis 7 · TypeScript 6.

## Bounded Contexts (feature libs)

| Lib | Alias | Status |
|-----|-------|--------|
| `identity` | `@lms/identity` | Scaffolded (Phase 1) |
| `courses` | `@lms/courses` | Deferred |
| `enrollments` | `@lms/enrollments` | Deferred |
| `assessments` | `@lms/assessments` | Deferred |
| `billing` | `@lms/billing` | Deferred |

## Infrastructure Libs

| Lib | Alias | Level |
|-----|-------|-------|
| `config` | `@lms/infra-config` | base |
| `logger` | `@lms/infra-logger` | base |
| `database` | `@lms/infra-database` | service |

## Decision Records

See `adr/` for individual decisions.

