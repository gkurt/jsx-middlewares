import { createMiddlewareContext } from 'jsx-middlewares';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';

// Re-exported by each example's local jsx-runtime. Files using `@jsxImportSource .`
// resolve their JSX namespace from that runtime module, so without this they fall
// back to an unaugmented global namespace and the `$directive` attributes declared
// in src/types.d.ts are not visible on components.
export type { JSX } from 'react/jsx-runtime';

export function createLocalJsxContext() {
  return createMiddlewareContext(_jsx, _jsxs);
}
