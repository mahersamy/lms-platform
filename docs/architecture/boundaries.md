# Boundary Rules

## Cross-lib boundaries (enforced by Nx + ESLint)

Defined in `eslint.config.mjs` via `@nx/enforce-module-boundaries`.

### Type hierarchy

```
type:app
  └─ type:feature   (never imports another feature)
       └─ type:infra
            └─ type:shared   (no external imports at all)
```

### Infra level hierarchy

```
level:service  →  level:base  →  type:shared
```

`database` (level:service) may import `config` (level:base).  
`config` (level:base) may **not** import `database`.

### Scope isolation

Each feature scope (`scope:identity`, etc.) may only depend on its own scope or `scope:shared`.  
Cross-feature communication goes through:
1. Domain / integration **events** published to `@lms/shared-kernel`
2. A **public port** (`interface`) exported from the source feature's `index.ts`

Never import another feature's `domain/`, `infrastructure/`, or `presentation/` internals.

## Within-lib boundaries (enforced by no-restricted-imports)

The four layers inside a single feature lib are **not** separate Nx projects, so Nx tag rules can't see them.  
Layer rules are enforced by ESLint `no-restricted-imports` overrides per folder (see `adr/0003-layer-rules.md`).

| Layer | May import |
|-------|-----------|
| `domain/` | `@lms/shared-kernel` only — no Nest, no Drizzle |
| `application/` | `domain/`, `@lms/shared-kernel` |
| `infrastructure/` | `application/`, `domain/`, infra libs |
| `presentation/` | `application/`, `domain/` types |
| `*.module.ts` | all four layers (wiring only) |

