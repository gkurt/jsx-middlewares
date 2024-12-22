export type jsxClassicFn<JSXEl> = (type: any, props: any, ...children: any[]) => JSXEl;
export type jsxFn<JSXEl> = (type: any, props: any, key: any) => JSXEl;
export type jsxDEVFn<JSXEl> = (type: any, props: any, key: any, isStatic: boolean, source: any, self: any) => JSXEl;

export type MiddlewareNextFn<JSXEl, Node> = {
  (type: any, props: any, key?: any): Node | JSXEl;
  context: MiddlewareContext<JSXEl, Node>;
  original: jsxFn<JSXEl>;
};

type Falsy = false | null | undefined | 0 | '';

export type Middleware<JSXEl, Node> =
  | Falsy
  | ((next: MiddlewareNextFn<JSXEl, Node>, type: any, props: any, key: any) => Node);

export interface MiddlewareContext<JSXEl, Node> {
  addMiddlewares(...middlewares: Middleware<JSXEl, Node>[]): MiddlewareContext<JSXEl, Node>;
  removeMiddlewares(...middlewares: Middleware<JSXEl, Node>[]): MiddlewareContext<JSXEl, Node>;
  clearMiddlewares(): MiddlewareContext<JSXEl, Node>;
  jsxClassic: jsxClassicFn<JSXEl | Node>;
  jsx: jsxFn<JSXEl | Node>;
  jsxs: jsxFn<JSXEl | Node>;
  jsxDEV: jsxDEVFn<JSXEl | Node>;
  Fragment: unknown;
  clone<TJSXEl extends JSXEl = JSXEl, TNode extends Node = Node>(
    jsx?: jsxFn<TJSXEl>,
    jsxs?: jsxFn<TJSXEl>,
    jsxDEV?: jsxDEVFn<TJSXEl>,
    Fragment?: unknown,
  ): MiddlewareContext<TJSXEl, TNode>;
}
