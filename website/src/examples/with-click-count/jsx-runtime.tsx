import { useState } from 'react';
import { createLocalJsxContext } from '../setup';

export type { JSX } from '../setup';

const ctx = createLocalJsxContext();
export const { jsx, jsxDEV, jsxs } = ctx;

function WithClickCount({ render, props, type }) {
  const [count, setCount] = useState(0);

  const baseOnClick = props.onClick;

  props = {
    ...props,
    onClick: (e) => {
      setCount(count + 1);
      baseOnClick?.(e);
    },
    children: [props.children, ` - Clicked ${count} times`],
  };

  return render(type, props);
}

function withClickCountMiddleware(next, type, props, key) {
  if (props.$withClickCount) {
    const { $withClickCount, ...restProps } = props;
    return <WithClickCount render={next} type={type} props={restProps} key={key} />;
  }

  return next(type, props, key);
}

ctx.addMiddlewares(withClickCountMiddleware);
