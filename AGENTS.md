# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Commands

Run these from the repo root; they fan out to the right workspace.

```bash
bun run test       # Run all tests
bun typecheck      # Type check (TypeScript 7, native tsc)
bun run lint       # Lint
bun run format     # Format
bun run fix        # Lint + format + autofix
bun run checks     # Everything: check + typecheck + test
bun run build      # Build packages/jsx-middlewares/dist with tsdown (ESM-only)
bun run attw       # Validate published types (esm-only profile)
bun run publint    # Validate package publishing metadata
```

Prefer these scripts over ad-hoc commands. Do not prefix them with `bun run` when
a bare alias exists (`bun check`, `bun typecheck`) — those are whitelisted for
agent use.

The package's `test` script passes `--conditions=jsx-middlewares@dev`. That flag is
critical: without it the tests resolve `jsx-middlewares` to the built `dist`
instead of `src`.

`website` and `examples/vite` resolve `jsx-middlewares` through a real Bun
workspace symlink, and they consume the **built** `dist`. Run `bun run build`
before building either of them on a fresh checkout.

## Project Structure

A Bun workspace monorepo. The only published package is `packages/jsx-middlewares`;
the root, `website`, and `examples/*` are all `private`.

```
package.json                       # Private root: Biome, husky, Tegami, fan-out scripts
tsconfig.json                      # Shared TS base; also typechecks scripts/
scripts/tegami.mts                 # Release config (Tegami)
.tegami/                           # Pending changelog entries
packages/jsx-middlewares/          # THE published package
  src/
    index.ts                       # Public entry: createMiddlewareContext + types
    context.ts                     # The whole engine — middleware composition lives here
    types.ts                       # Middleware, MiddlewareContext, jsx*Fn signatures
    react/
      base.ts                      # React-typed context + the `baseMiddlewares` singleton
      index.ts                     # `jsx-middlewares/react` entry
      jsx-runtime.ts               # `jsx-middlewares/react/jsx-runtime` (prod transform)
      jsx-dev-runtime.ts           # `jsx-middlewares/react/jsx-dev-runtime` (dev transform)
      types.ts                     # React-bound aliases of the base types
  tests/
    preload.ts                     # Stubs `react/jsx-dev-runtime` (see Testing below)
    jsx-dev-runtime.ts             # A fake JSX runtime used as a pragma target
    base.test.tsx                  # Core middleware behaviour, via JSX
    context.test.ts                # Context composition, clones, jsxDEV arg threading
    react/react.test.tsx           # The React entrypoints end to end
  tsdown.config.ts                 # ESM-only build, .mjs / .d.mts extensions
  README.md, LICENSE               # Copies — npm reads the package's own files
examples/vite/                     # Vite + React playground (workspace)
website/                           # Docusaurus docs site (workspace)
```

**The README exists twice on purpose**: the root `README.md` is the GitHub landing
page, and `packages/jsx-middlewares/README.md` is what npm renders. Update both in
the same change.

## Architecture

`createMiddlewareContext` builds a context holding a mutable middleware list and
pre-composed `jsx` / `jsxs` / `jsxDEV` callbacks.

Two invariants matter most:

1. **The chain is composed once, not per element.** `refreshCallbacks` rebuilds the
   composed callbacks only when the middleware list changes. `jsxDEV`'s extra
   arguments (`isStaticChildren`, `source`, `self`) cannot travel through the
   chain — it only carries `(type, props, key)` — so they are threaded through
   closure variables that are saved and restored around each call. That
   save/restore is what keeps them correct when a middleware creates nested
   elements before calling `next`.

2. **Clones share one middleware list and one change-notification list.** `clone()`
   passes both arrays by reference, so adding a middleware through any context in
   the tree refreshes every context in it. This is why `jsx-middlewares/react` and
   `jsx-middlewares/react/jsx-runtime` see the same middlewares. The build must
   keep `src/react/base.ts` in a single shared chunk for that singleton to hold —
   don't split it per entrypoint.

## Testing

Tests run on `bun test`. Two pieces of indirection are load-bearing:

- **`tests/preload.ts`** stubs `react/jsx-dev-runtime` so the React tests can assert
  on plain `[type, props, key]` tuples. It is a preload (registered in
  `bunfig.toml`) rather than an inline `mock.module` because `mock.module` is not
  hoisted the way Vitest's `vi.mock` is, and the `@jsxImportSource` pragma emits a
  static import that would otherwise win the race. Because the stub makes the
  runtime return tuples while the static type stays `ReactElement`, those
  assertions need `expect(result as unknown)`.
- **`@jsxImportSource #test-runtime`** in `tests/base.test.tsx` resolves via the
  `imports` map in `packages/jsx-middlewares/package.json`. The pragma appends
  `/jsx-dev-runtime` to whatever you give it, and `nodenext` cannot resolve that
  extensionless — hence the explicit `#test-runtime/jsx-dev-runtime` mapping.

## Key Conventions

- **Runtime**: Bun. **Language**: TypeScript (strict, ESNext, `nodenext` modules).
- **Formatting**: Biome — 2-space indent, single quotes, 140 char line width, LF.
- **Imports**: use `.ts` extensions in source imports (`verbatimModuleSyntax` is on).
- **ESM-only.** The package publishes no CJS. Don't reintroduce `main`, a `require`
  condition, or a `cjs` build format.
- `erasableSyntaxOnly` is on, so no `enum`, no runtime `namespace`, no parameter
  properties. Type-only namespaces must be `declare namespace`.

## Coding Conventions

- Prefer colocation.
- Use TypeScript with strict typing. Avoid `any` unless absolutely necessary.
- Always use top-level `import type` for type imports. Never use inline
  `import('./module.ts').Type` syntax in type annotations.
- Avoid verbose code comments; write self-explanatory code. Comments are acceptable for:
  - Explaining complex logic, workarounds, or decisions
  - Documenting public APIs (functions, classes, modules)
  - TODO/FIXME notes
  - When the user specifically asks for comments
- Prefer concise, clear code:
  - Prefer early returns to reduce nesting.
  - Prefer single-line `if` statements for simple conditions.
- If a file gets too long (e.g. >600 lines), refactor into smaller modules.
- Check for existing utilities/hooks/components before creating new ones. Avoid duplication.
- Remove dead and commented-out code; don't preserve old APIs unless asked.
- When moving or relocating code (functions, components, utilities), don't leave a re-export behind for backwards compatibility. Update every importer to point at the new location and delete the old definition, so there is a single source of truth.
- Variables and regular functions shouldn't be prefixed with `use`. The `use` prefix should be reserved for React hooks.
- Don't use `forwardRef`. React 19 supports passing refs to function components directly, so `forwardRef` is no longer necessary and adds unnecessary complexity.
- Avoid `useEffect` unless absolutely necessary; prefer custom hooks.
  - If you decided to use `useEffect`, read this first, and reevaluate your decision: https://react.dev/learn/you-might-not-need-an-effect
  - Always put a comment explaining what the effect does.

## Documentation

When changing user-facing APIs, update all relevant docs in the same change:
`website/docs/`, both `README.md` copies, and `AGENTS.md`. Documentation must not
go stale.

## Changelogs

Releases are managed by [Tegami](https://tegami.fuma-nama.dev) (config in
`scripts/tegami.mts`). When asked to commit with a changelog entry, run
`bun run tegami` or add a `.tegami/*.md` file directly. Each entry has
`packages:` frontmatter (package + bump type) and a body with at least one
heading. Keep entries concise — user-facing changes only, no implementation detail.
