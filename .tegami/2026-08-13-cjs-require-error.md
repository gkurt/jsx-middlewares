---
packages:
  "npm:jsx-middlewares": patch
---

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
