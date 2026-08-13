import type { JSX, ReactNode } from 'react';
import type * as Base from '../types.ts';

export type Middleware = Base.Middleware<JSX.Element, ReactNode>;
export type MiddlewareContext = Base.MiddlewareContext<JSX.Element, ReactNode>;
export type MiddlewareNextFn = Base.MiddlewareNextFn<JSX.Element, ReactNode>;
export type jsxFn = Base.jsxFn<JSX.Element>;
export type jsxDEVFn = Base.jsxDEVFn<JSX.Element>;
export type jsxClassicFn = Base.jsxClassicFn<JSX.Element>;
