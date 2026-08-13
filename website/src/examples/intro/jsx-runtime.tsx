import { createLocalJsxContext } from '../setup';

export type { JSX } from '../setup';

const ctx = createLocalJsxContext();
export const { jsx, jsxDEV, jsxs } = ctx;

ctx.addMiddlewares(function emojiMiddleware(next, type, props, key) {
  // Modify the props to add an emoji to the text
  if (typeof type === 'string' && typeof props.children === 'string') {
    props = {
      ...props,
      children: `${props.children} 🎉`,
    };
  }

  // Call the next middleware with the new props
  // If there is no next middleware, it will call the original JSX renderer
  return next(type, props, key);
});
