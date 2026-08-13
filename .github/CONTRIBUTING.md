## Contributing guidelines

- This repo runs on [Bun](https://bun.sh). Install it first, then `bun i`.
- Use VSCode when possible. This will ensure that documents are formatted properly (with Biome).
- Install recommended VSCode extensions.
- `bun run checks` and `bun run build` must pass in order to be able to release.

## Commands

- `bun run start` - Rebuild `dist` on change
- `bun run build` - Build for production
- `bun run test` - Run the test suite (`bun test`)
- `bun typecheck` - Type check with TypeScript
- `bun check` - Run Biome (lint + format)
- `bun run fix` - Apply Biome autofixes
- `bun run checks` - Everything above that gates a release

## Changelogs

Releases are managed by [Tegami](https://tegami.fuma-nama.dev). Add a changelog
entry for user-facing changes with `bun run tegami`.
