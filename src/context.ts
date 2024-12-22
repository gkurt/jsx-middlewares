import type { Middleware, MiddlewareContext, MiddlewareNextFn, jsxDEVFn, jsxFn } from './types.ts';

export function createMiddlewareContext<JSXEl, Node = JSXEl>(
  defaultJsx?: jsxFn<JSXEl> | undefined,
  defaultJsxs?: jsxFn<JSXEl> | undefined,
  defaultJsxDEV?: jsxDEVFn<JSXEl> | undefined,
  defaultFragment?: unknown,
) {
  return createMiddlewareContextWithDefaults<JSXEl, Node>(
    [],
    undefined,
    defaultJsx,
    defaultJsxs,
    defaultJsxDEV,
    defaultFragment,
  );
}

function createMiddlewareContextWithDefaults<JSXEl, Node>(
  middlewares: Middleware<JSXEl, Node>[] = [],
  registerOnChange?: (cb: () => void) => void,
  defaultJsx?: jsxFn<JSXEl> | undefined,
  defaultJsxs?: jsxFn<JSXEl> | undefined,
  defaultJsxDEV?: jsxDEVFn<JSXEl> | undefined,
  defaultFragment?: unknown,
) {
  defaultJsxs ??= defaultJsx;
  defaultJsxDEV ??= defaultJsx;

  let jsxCb: jsxFn<JSXEl | Node>;
  let jsxsCb: jsxFn<JSXEl | Node>;
  let jsxDEVCb: jsxDEVFn<JSXEl | Node>;

  const registeredCallbacks: (() => void)[] = [];
  const registerOnChangeFn = (cb: () => void) => registeredCallbacks.push(cb);

  function refreshCallbacks() {
    jsxCb = createCallback(defaultJsx?.bind(null)!);

    jsxsCb = createCallback(defaultJsxs?.bind(null)!);

    jsxDEVCb = function jsxDEV(type, props, key, isStaticChildren, source, self) {
      return createCallback(function defaultJsxDEVWrapper(type, props, key) {
        return defaultJsxDEV!(type, props, key, isStaticChildren, source, self);
      })(type, props, key);
    } as jsxDEVFn<JSXEl>;

    for (const cb of registeredCallbacks) cb();
  }

  registerOnChange?.(refreshCallbacks);

  function createCallback(jsx: jsxFn<JSXEl>) {
    let cb = jsx as MiddlewareNextFn<JSXEl, Node>;
    if (cb) {
      cb.context = ctx;
      cb.original = jsx;
    }

    for (let index = 0; index < middlewares.length; index++) {
      const mw = middlewares[index];
      if (!mw) continue;

      cb = mw.bind(null, cb) as MiddlewareNextFn<JSXEl, Node>;
      cb.context = ctx;
      cb.original = jsx;
    }

    return cb;
  }

  function addMiddlewares(...items: Middleware<JSXEl, Node>[]) {
    middlewares.push(...items);
    refreshCallbacks();

    return ctx;
  }

  function removeMiddlewares(...items: Middleware<JSXEl, Node>[]) {
    for (const item of items) {
      const index = middlewares.indexOf(item);
      if (index > -1) {
        middlewares.splice(index, 1);
      }
    }

    refreshCallbacks();

    return ctx;
  }

  function clearMiddlewares() {
    middlewares.length = 0;
    refreshCallbacks();
    return ctx;
  }

  function jsxClassic(type: any, props: any, ...children: any[]) {
    let key: any;
    ({ key, ...props } = props || {});

    if (children != null && children.length > 0) {
      if (children.length === 1) {
        props.children = children[0];
        return jsxCb(type, props, key);
      }

      props.children = children;
    }

    return jsxsCb(type, props, key);
  }

  function jsx(type: any, props: any, key: any) {
    return jsxCb(type, props, key);
  }

  function jsxs(type: any, props: any, key: any) {
    return jsxsCb(type, props, key);
  }

  function jsxDEV(type: any, props: any, key: any, isStaticChildren: boolean, source: any, self: any) {
    return jsxDEVCb(type, props, key, isStaticChildren, source, self);
  }

  function clone<TJSXEl extends JSXEl = JSXEl, TNode extends Node = Node>(
    jsx?: jsxFn<TJSXEl>,
    jsxs?: jsxFn<TJSXEl>,
    jsxDEV?: jsxDEVFn<TJSXEl>,
    Fragment?: unknown,
  ) {
    return createMiddlewareContextWithDefaults<TJSXEl, TNode>(
      middlewares as any,
      registerOnChangeFn,
      jsx || (defaultJsx as any),
      jsxs || (defaultJsxs as any),
      jsxDEV || (defaultJsxDEV as any),
      Fragment || defaultFragment,
    );
  }

  const ctx: MiddlewareContext<JSXEl, Node> = {
    addMiddlewares,
    removeMiddlewares,
    clearMiddlewares,
    jsxClassic,
    jsx,
    jsxs,
    jsxDEV,
    clone,
    Fragment: defaultFragment,
  };

  refreshCallbacks();

  return ctx;
}
