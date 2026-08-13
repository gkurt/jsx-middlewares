import { memo } from 'react';
import { createLocalJsxContext } from '../setup';

const ctx = createLocalJsxContext();
export const { jsx, jsxDEV, jsxs } = ctx;

const memoMap = new Map();

ctx.addMiddlewares(function memoMiddleware(next, type, props, key) {
  if (!('$memo' in props)) return next(type, props, key);

  const { $memo, ...rest } = props;
  if ($memo && typeof type === 'function') {
    let memoed = memoMap.get(type);
    if (!memoed) {
      memoed = memo(type);
      memoMap.set(type, memoed);
    }

    return next(memoed, rest, key);
  }

  return next(type, rest, key);
});
