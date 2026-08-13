/** @jsxImportSource #test-runtime */

import { afterEach, describe, expect, test } from 'bun:test';
import type { Middleware, MiddlewareContext } from 'jsx-middlewares';
import { mw } from './jsx-dev-runtime.ts';

describe('jsx-middlewares', () => {
  afterEach(() => {
    mw.clearMiddlewares();
  });

  test('returns the original results without middlewares', () => {
    const result = <div className={'testcn'} key={5} />;
    expect(result).toEqual(['div', { className: 'testcn' }, 5]);
  });

  test('returns the intercepted result when middleware intercepts', () => {
    mw.addMiddlewares(function intercept(next, type, props, key) {
      return next(type, { ...props, className: 'intercepted' }, key);
    });

    const result = <div title={'testtitle'} className={'testcn'} key={5} />;
    expect(result).toEqual(['div', { title: 'testtitle', className: 'intercepted' }, 5]);
  });

  test('can add and remove middlewares', () => {
    const className1: Middleware<any, any> = function className1(next, type, props, key) {
      return next(type, { ...props, className: `${props.className} c1` }, key);
    };

    const className2: Middleware<any, any> = function className2(next, type, props, key) {
      return next(type, { ...props, className: `${props.className} c2` }, key);
    };

    mw.addMiddlewares(className1, className2);

    mw.removeMiddlewares(className2);

    const result = <div title={'testtitle'} className={'c0'} key={5} />;
    expect(result).toEqual(['div', { title: 'testtitle', className: 'c0 c1' }, 5]);
  });

  test('first middleware runs last (lifo)', () => {
    mw.addMiddlewares(
      function className1(next, type, props, key) {
        return next(type, { ...props, className: `${props.className} c1` }, key);
      },
      function className2(next, type, props, key) {
        return next(type, { ...props, className: `${props.className} c2` }, key);
      },
    );

    const result = <div title={'testtitle'} className={'c0'} key={5} />;
    expect(result).toEqual(['div', { title: 'testtitle', className: 'c0 c2 c1' }, 5]);
  });

  test('able to wrap elements', () => {
    mw.addMiddlewares(function wrap(next, type, { '$-wrap': w, ...props }, key) {
      const res = next(type, props, key);

      if (w) {
        return <section>{res}</section>;
      }

      return res;
    });

    const notWrapped = <div className="go" key={5} />;
    expect(notWrapped).toEqual(['div', { className: 'go' }, 5]);

    const wrapped = <div className="go" key={5} $-wrap />;
    expect(wrapped).toEqual(['section', { children: ['div', { className: 'go' }, 5] }, undefined]);
  });

  test('next function includes context', () => {
    mw.addMiddlewares(function wrap(next, type, props, key) {
      return next(type, { ...props, context: next.context }, key);
    });

    const notWrapped = <div className="go" key={5} />;
    expect((notWrapped as any)[1]?.context as MiddlewareContext<any, any>).toEqual(mw);
  });

  test('can use original to bypass other middlewares', () => {
    mw.addMiddlewares(
      function mw1(next, type, props, key) {
        return next(type, { ...props, notBypassed: true }, key);
      },
      function mw2(next, type, props, key) {
        return next.original(type, props, key);
      },
    );

    const notWrapped = <div className="go" key={5} />;
    expect((notWrapped as any)[1]?.notBypassed).toBeFalsy();
  });
});
