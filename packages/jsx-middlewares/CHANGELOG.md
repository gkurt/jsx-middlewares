## jsx-middlewares@3.0.1

### `require()` no longer fails with a confusing "no exports main defined" error

The package stays ESM-only, but its `exports` map previously had no entry that a
CommonJS resolution could match, so `require('jsx-middlewares')` failed with
`ERR_PACKAGE_PATH_NOT_EXPORTED: No "exports" main defined` — which reads like a
broken package rather than an ESM-only one.

Each entrypoint now also declares a `default` condition pointing at the same ESM
build. On Node 22 and newer, `require()` of this package now works through
`require(esm)`. On older Node it fails with the accurate `ERR_REQUIRE_ESM`
instead.

No CommonJS build was reintroduced, and there is still only one copy of the
module, so middlewares registered through any entrypoint continue to share a
single list.

## jsx-middlewares@3.0.0

### The package is now ESM-only

`jsx-middlewares` no longer ships a CommonJS build. The `main` field and the CJS
entrypoints are gone; every export resolves through the `import` condition.

If you `require('jsx-middlewares')`, switch to an `import`, or stay on `2.x`.
Bundlers and modern Node/Bun consumers need no changes.

### Published entrypoints now expose their source

Each export also carries a `source` condition pointing at the original
TypeScript, and `src/` is included in the published package, so tooling that
prefers source can pick it up and stack traces map back to real files.

# jsx-middlewares

## 2.4.0

### Minor Changes

- 5a77ee3: Allow returning ReactNode compatible types from middlewares

## 2.1.0

### Minor Changes

- add fragment to middleware context

## 2.0.6

### Patch Changes

- fix mjs imports

## 2.0.5

### Patch Changes

- 2bde568: fix dev export conditions

## 2.0.4

### Patch Changes

- cb96c2e: fix cjs exports

## 2.0.3

### Patch Changes

- cba2f8e: Support ESM and CJS

## 2.0.2

### Patch Changes

- 8751677: Expose jsx types from react folder

## 2.0.1

### Patch Changes

- d30a28c: Expose createMiddlewareContext in react folder

## 2.0.0

### Major Changes

- 2c7799c: Added support for React 19
