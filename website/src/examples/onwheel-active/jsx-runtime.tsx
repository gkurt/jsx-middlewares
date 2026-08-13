import { cloneElement, forwardRef, useCallback, useRef } from 'react';
import { isElement } from 'react-is';
import { createLocalJsxContext } from '../setup';

const ctx = createLocalJsxContext();
export const { jsx, jsxDEV, jsxs } = ctx;

export const WithOnWheelActive = forwardRef<HTMLElement, any>(function _WithOnWheelActive({ callback, children }, ref) {
  const cleanup = useRef<() => void>(undefined);

  const mergedRef = useCallback(
    (val) => {
      if (typeof ref === 'function') ref(val);
      else if (ref) ref.current = val;

      cleanup.current?.();
      cleanup.current = undefined;

      if (!callback) return;

      if (val) {
        val.addEventListener('wheel', callback, { passive: false });
        cleanup.current = () => val.removeEventListener('wheel', callback);
      }
    },
    [ref, callback],
  );

  if (!isElement(children)) {
    throw new Error('Children passed to <Ripple> must be an element with ref');
  }

  return cloneElement(children, {
    ...children.props,
    ref: mergedRef,
  });
});

function onWheelActiveDirective(next, type, props, key) {
  if (!('$onWheelActive' in props)) return next(type, props, key);

  const { $onWheelActive, ...rest } = props;
  if ($onWheelActive) {
    return (
      <WithOnWheelActive callback={$onWheelActive} key={key}>
        {next(type, rest)}
      </WithOnWheelActive>
    );
  }

  return next(type, rest, key);
}

ctx.addMiddlewares(onWheelActiveDirective);
