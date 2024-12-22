import { Fragment, JSX, jsxDEV as _jsxDEV } from 'react/jsx-dev-runtime';
import { baseMiddlewares } from './base.ts';

export { Fragment, type JSX } from 'react/jsx-dev-runtime';

const ctx = baseMiddlewares.clone<JSX.Element>(undefined, undefined, _jsxDEV, Fragment);

export const jsxDEV = ctx.jsxDEV;
