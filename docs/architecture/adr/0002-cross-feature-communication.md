# ADR 0002 — Cross-Feature Communication via Events and Public Ports

**Date:** 2026-11-10  
**Status:** Accepted

## Context

The scope isolation rule (`scope:identity` can only depend on `scope:identity` or `scope:shared`) prevents features from importing each other's internals. We still need a way for them to interact.

## Decision

Two allowed channels:

1. **Domain / integration events** — a feature emits a typed event that extends `DomainEvent` from `@lms/shared-kernel`. Other features subscribe without knowing the emitter's internals.

2. **Public ports** — a feature exports a TypeScript `interface` from its `index.ts`. Another feature may depend on that interface (never on the implementation). The implementation is registered via NestJS DI in `app.module.ts`.

## Cross-feature references: IDs only

If feature A stores a reference to feature B's aggregate, it stores **only the ID** (a plain `string` or a typed ID), not a foreign-key join through B's tables.

## Consequences

- `index.ts` in every feature lib is the **only allowed import boundary**. Anything not exported from `index.ts` is private.
- DB-level joins across feature tables are forbidden — use a read-model or query service instead.
- `apps/api` is the only place that wires features together (via NestJS module imports).

