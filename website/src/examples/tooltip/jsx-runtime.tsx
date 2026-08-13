import { createLocalJsxContext } from '../setup';
import styles from './index.module.css';

const ctx = createLocalJsxContext();
export const { jsx, jsxDEV, jsxs } = ctx;

function tooltipMiddleware(next, type, props, key) {
  if (!('$tooltip' in props)) return next(type, props, key);

  const { $tooltip, ...rest } = props;
  if ($tooltip) {
    return (
      <div className={styles.tooltipContainer}>
        {<div className={styles.tooltip}>{$tooltip}</div>}
        {next(type, rest, key)}
      </div>
    );
  }

  return next(type, rest, key);
}

ctx.addMiddlewares(tooltipMiddleware);
