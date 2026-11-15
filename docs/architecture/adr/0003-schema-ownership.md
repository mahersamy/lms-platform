# ADR 0003 — Drizzle Schema Ownership (Per-Feature)

**Date:** 2026-11-10  
**Status:** Accepted

## Context

Drizzle schemas define the actual database tables. Where they live determines ownership and visibility boundaries.

## Decision

Each feature **owns its own table definitions**. Schema files live inside the feature's `infrastructure/` folder:

```
libs/features/<name>/src/lib/infrastructure/<name>.schema.ts
```

`drizzle.config.ts` collects them all with a glob:

```ts
schema: './libs/features/**/*.schema.ts'
```

`libs/infrastructure/database` holds **only** the connection, the Drizzle client module, and transaction helpers. It never defines tables.

## Consequences

- Deleting a feature also deletes its tables — no orphan schema files.
- No feature reads another feature's tables directly. Cross-feature queries go through events or a public read-model port.
- `tools/database/migrations/` holds the generated SQL — it is the only artifact that sees all tables together.

