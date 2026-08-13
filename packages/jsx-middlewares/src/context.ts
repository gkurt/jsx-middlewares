import type { jsxDEVFn, jsxFn, Middleware, MiddlewareContext, MiddlewareNextFn } from './types.ts';

export function createMiddlewareContext<JSXEl, Node = JSXEl>(
  defaultJsx?: jsxFn<JSXEl> | undefined,
  defaultJsxs?: jsxFn<JSXEl> | undefined,
  defaultJsxDEV?: jsxDEVFn<JSXEl> | undefined,
  defaultFragment?: unknown,
) {
  return createMiddlewareContextWithDefaults<JSXEl, Node>([], [], defaultJsx, defaultJsxs, defaultJsxDEV, defaultFragment);
}

function createMiddlewareContextWithDefaults<JSXEl, Node>(
  middlewares: Middleware<JSXEl, Node>[] = [],
  // Shared across the whole clone tree, so a middleware change through any context
  // refreshes every context that composes the same middleware list.
  onChangeCallbacks: (() => void)[] = [],
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

  function refreshCallbacks() {
    jsxCb = createCallback(defaultJsx?.bind(null));

    jsxsCb = createCallback(defaultJsxs?.bind(null));

    // The chain only carries (type, props, key), so the extra jsxDEV arguments are threaded
    // through closure variables. Save/restore keeps them correct when a middleware creates
    // nested elements before calling next.
    let devIsStatic: boolean;
    let devSource: any;
    let devSelf: any;
    const devChain = createCallback(function defaultJsxDEVWrapper(type, props, key) {
      return defaultJsxDEV!(type, props, key, devIsStatic, devSource, devSelf);
    });

    jsxDEVCb = function jsxDEV(type, props, key, isStaticChildren, source, self) {
      const prevIsStatic = devIsStatic;
      const prevSource = devSource;
      const prevSelf = devSelf;
      devIsStatic = isStaticChildren;
      devSource = source;
      devSelf = self;
      try {
        return devChain(type, props, key);
      } finally {
        devIsStatic = prevIsStatic;
        devSource = prevSource;
        devSelf = prevSelf;
      }
    } as jsxDEVFn<JSXEl>;
  }

  onChangeCallbacks.push(refreshCallbacks);

  function notifyChange() {
    for (const cb of onChangeCallbacks) cb();
  }

  // `jsx` is optional: a context can be created without a default factory (a bare
  // `createMiddlewareContext()`), in which case the innermost `next` of the chain is
  // undefined and only middlewares that never call through are usable.
  function createCallback(jsx: jsxFn<JSXEl> | undefined) {
    let cb = jsx as MiddlewareNextFn<JSXEl, Node>;
    if (jsx) {
      cb.context = ctx;
      cb.original = jsx;
    }

    for (let index = 0; index < middlewares.length; index++) {
      const mw = middlewares[index];
      if (!mw) continue;

      cb = mw.bind(null, cb) as MiddlewareNextFn<JSXEl, Node>;
      cb.context = ctx;
      if (jsx) cb.original = jsx;
    }

    return cb;
  }

  function addMiddlewares(...items: Middleware<JSXEl, Node>[]) {
    middlewares.push(...items);
    notifyChange();

    return ctx;
  }

  function removeMiddlewares(...items: Middleware<JSXEl, Node>[]) {
    for (const item of items) {
      const index = middlewares.indexOf(item);
      if (index > -1) {
        middlewares.splice(index, 1);
      }
    }

    notifyChange();

    return ctx;
  }

  function clearMiddlewares() {
    middlewares.length = 0;
    notifyChange();
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
      onChangeCallbacks,
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
