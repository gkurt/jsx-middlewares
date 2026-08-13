import React from 'react';
import { createLocalJsxContext } from '../setup';
import { Ripple } from './ripple';

export type { JSX } from '../setup';

const ctx = createLocalJsxContext();
export const { jsx, jsxDEV, jsxs } = ctx;

function rippleMiddleware(next, type, props, key) {
  if (!('$ripple' in props) && type !== 'button') return next(type, props, key);

  const { $ripple, ...rest } = props;
  if ($ripple || (type === 'button' && $ripple !== false)) {
    return <Ripple>{next(type, rest, key)}</Ripple>;
  }

  return next(type, rest, key);
}

ctx.addMiddlewares(rippleMiddleware);
