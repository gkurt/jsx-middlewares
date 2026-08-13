import type { Middleware } from 'jsx-middlewares/react';
import styles from './index.module.scss';

export const tooltipMiddleware: Middleware = function tooltipMiddleware(next, type, { $tooltip, ...props }, key) {
  if ($tooltip) {
    return (
      <div className={styles.tooltipContainer}>
        {<div className={styles.tooltip}>{$tooltip}</div>}
        {next(type, props, key)}
      </div>
    );
  }

  return next(type, props, key);
};
