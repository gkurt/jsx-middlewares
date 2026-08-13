// Reached from tests/base.test.tsx both directly and via its
// `@jsxImportSource #test-runtime` pragma, which the root package.json `imports`
// field maps to this file. The pragma appends `/jsx-dev-runtime` to the source, and
// nodenext cannot resolve that extensionless, hence the explicit mapping.
import { createMiddlewareContext } from 'jsx-middlewares';

export const Fragment = Symbol('React.Fragment test');

const baseJsx = (type: any, props: any, key: any) => [type, props, key] as any;
export const mw = createMiddlewareContext(baseJsx, baseJsx, baseJsx).clone(baseJsx, baseJsx, baseJsx);
export const jsxDEV = mw.jsxDEV;

// `declare` keeps this erasable under `erasableSyntaxOnly` — it carries no runtime value.
export declare namespace JSX {
  export type Fragment = typeof Fragment;
  export type ElementClass = any;
  export type Element = any;
  export type IntrinsicElements = Record<string, any>;
}
