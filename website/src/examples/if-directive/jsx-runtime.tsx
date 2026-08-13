import { createLocalJsxContext } from '../setup';

export type { JSX } from '../setup';

const ctx = createLocalJsxContext();
export const { jsx, jsxDEV, jsxs } = ctx;

function ifDirectiveMiddleware(next, type, props, key) {
  if ('$if' in props) {
    if (!props.$if) return null;
    const { $if, ...rest } = props;
    props = rest;
  }

  return next(type, props, key);
}

ctx.addMiddlewares(ifDirectiveMiddleware);
