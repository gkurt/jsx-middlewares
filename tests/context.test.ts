import { createMiddlewareContext } from 'jsx-middlewares';

const baseJsx = (type: any, props: any, key: any) => [type, props, key] as any;

describe('middleware context composition', () => {
  test('jsxDEV forwards dev-only arguments through the middleware chain', () => {
    const devCalls: any[] = [];
    const devJsx = (type: any, props: any, key: any, isStatic: any, source: any, self: any) => {
      devCalls.push([type, isStatic, source, self]);
      return [type, props, key] as any;
    };

    const ctx = createMiddlewareContext(baseJsx, baseJsx, devJsx);
    ctx.addMiddlewares((next, type, props, key) => next(type, props, key));

    ctx.jsxDEV('div', {}, undefined, true, 'outer-src', 'outer-self');
    expect(devCalls).toEqual([['div', true, 'outer-src', 'outer-self']]);
  });

  test('jsxDEV keeps dev-only arguments correct across nested element creation', () => {
    const devCalls: any[] = [];
    const devJsx = (type: any, props: any, key: any, isStatic: any, source: any, self: any) => {
      devCalls.push([type, isStatic, source, self]);
      return [type, props, key] as any;
    };

    const ctx = createMiddlewareContext(baseJsx, baseJsx, devJsx);
    ctx.addMiddlewares((next, type, props, key) => {
      // Only intercept divs, so the nested span below doesn't recurse into this middleware.
      if (type !== 'div') return next(type, props, key);

      // Create a nested element before calling next, like a wrapping middleware would.
      const inner = next.context.jsxDEV('span', {}, undefined, false, 'inner-src', 'inner-self');
      return next(type, { ...props, inner }, key);
    });

    ctx.jsxDEV('div', {}, undefined, true, 'outer-src', 'outer-self');

    expect(devCalls).toEqual([
      ['span', false, 'inner-src', 'inner-self'],
      ['div', true, 'outer-src', 'outer-self'],
    ]);
  });

  test('jsxDEV chain is composed once, not per element', () => {
    const nexts: any[] = [];

    const ctx = createMiddlewareContext(baseJsx, baseJsx, baseJsx);
    ctx.addMiddlewares((next, type, props, key) => {
      nexts.push(next);
      return next(type, props, key);
    });

    ctx.jsxDEV('div', {}, undefined, false, undefined, undefined);
    ctx.jsxDEV('div', {}, undefined, false, undefined, undefined);

    expect(nexts).toHaveLength(2);
    expect(nexts[0]).toBe(nexts[1]);
  });

  test('adding middlewares through a clone refreshes the parent and sibling contexts', () => {
    const root = createMiddlewareContext(baseJsx, baseJsx, baseJsx);
    const cloneA = root.clone();
    const cloneB = root.clone();

    cloneA.addMiddlewares((next, type, props, key) => next(type, { ...props, tagged: true }, key));

    expect((root.jsx('div', {}, undefined) as any)[1].tagged).toBe(true);
    expect((cloneB.jsx('div', {}, undefined) as any)[1].tagged).toBe(true);
    expect((cloneA.jsx('div', {}, undefined) as any)[1].tagged).toBe(true);
  });

  test('removing middlewares through a clone refreshes the parent and sibling contexts', () => {
    const root = createMiddlewareContext(baseJsx, baseJsx, baseJsx);
    const cloneA = root.clone();
    const cloneB = root.clone();

    const tag = (next: any, type: any, props: any, key: any) => next(type, { ...props, tagged: true }, key);
    root.addMiddlewares(tag);
    cloneA.removeMiddlewares(tag);

    expect((root.jsx('div', {}, undefined) as any)[1].tagged).toBeUndefined();
    expect((cloneB.jsx('div', {}, undefined) as any)[1].tagged).toBeUndefined();
  });
});
