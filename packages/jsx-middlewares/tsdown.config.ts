import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/react/index.ts', 'src/react/jsx-runtime.ts', 'src/react/jsx-dev-runtime.ts'],
  format: ['esm'],
  target: 'es2024',
  dts: true,
  clean: true,
  // Explicit `.mjs` / `.d.mts` extensions so the published entrypoints stay
  // unambiguous regardless of how a consumer's `type` field is set.
  outExtensions: () => ({ js: '.mjs', dts: '.d.mts' }),
});
