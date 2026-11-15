# ADR 0001 — Nx Tag Schema (type, scope, level)

**Date:** 2026-11-10  
**Status:** Accepted

## Context

We need machine-enforceable rules that say which library may depend on which other library. Nx's `@nx/enforce-module-boundaries` enforces rules based on arbitrary string tags attached to each `project.json`.

## Decision

Every project carries **two or three tags**:

| Dimension | Tag values | Meaning |
|-----------|-----------|---------|
| `type:*` | `app`, `feature`, `infra`, `shared`, `e2e` | Architectural role |
| `scope:*` | `identity`, `shared`, (future: `courses`, ...) | Business domain |
| `level:*` | `base`, `service` | Infra layering only |

**Type rules:**
- `type:app` → depends on `feature`, `infra`, `shared`
- `type:feature` → depends on `infra`, `shared` only
- `type:infra` → depends on `infra`, `shared` (level:service → level:base, never the reverse)
- `type:shared` → depends on `shared` only
- `type:e2e` → depends on `app` only

**Scope rules:** Every `scope:<feature>` can only depend on its own scope plus `scope:shared`.

## Consequences

- Adding a new feature requires: a scope rule in `eslint.config.mjs` + an alias in `tsconfig.base.json`.
- Infra libs that don't have a `level:*` tag are still bounded by their `type:infra` rule.
- Future multi-team scenario: scope tags become team ownership boundaries.

