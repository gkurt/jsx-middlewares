import { mock } from 'bun:test';

// The React tests assert on plain `[type, props, key]` tuples rather than real React
// elements, so the underlying React runtime is stubbed out.
//
// This lives in a preload rather than in the test file because `mock.module` is not
// hoisted the way Vitest's `vi.mock` is: the `@jsxImportSource` pragma emits a static
// import of the runtime under test, which would otherwise load the real
// `react/jsx-dev-runtime` before the mock could be registered.
const Fragment = Symbol('React.Fragment test');
const jsxDEV = (type: any, props: any, key: any) => [type, props, key] as any;

mock.module('react/jsx-dev-runtime', () => ({ Fragment, jsxDEV }));
