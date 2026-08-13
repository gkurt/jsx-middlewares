import type { Middleware } from 'jsx-middlewares/react';
import { memo } from 'react';

const memoMap = new Map();

export const memoMiddleware: Middleware = function memoMiddleware(next, type, { $memo, ...props }, key) {
  if ($memo && typeof type === 'function') {
    let memoed = memoMap.get(type);
    if (!memoed) {
      memoed = memo(type);
      memoMap.set(type, memoed);
    }

    return next(memoed, props, key);
  }

  return next(type, props, key);
};
