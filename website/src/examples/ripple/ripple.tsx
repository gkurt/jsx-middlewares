import React, {
  cloneElement,
  type FC,
  forwardRef,
  type ReactElement,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { isElement } from 'react-is';
import styles from './index.module.css';

export type RippleBaseProps = {
  noRipple?: boolean;
  centered?: boolean;
  target?: RefObject<HTMLDivElement>;
};

export type RippleComponentProps = RippleBaseProps & {
  component?: any;
  children?: ReactElement;
};

export function addRipple(containerElement: HTMLElement | null, pressPosition?: { x: number; y: number } | null) {
  if (!containerElement) return null;
  const ripple = document.createElement('div');
  ripple.className = `${styles.ripple} ${styles.entering}`;

  const rect = containerElement.getBoundingClientRect();

  const w = rect.width;
  const h = rect.height;
  const maxDimension = Math.max(w, h);

  if (pressPosition) {
    const posX = pressPosition.x - rect.x;
    const posY = pressPosition.y - rect.y;
    ripple.style.left = `${posX}px`;
    ripple.style.top = `${posY}px`;

    const hw = w / 2;
    const hh = h / 2;

    const rx = posX > hw ? 0 : w;
    const ry = posY > hh ? 0 : h;

    const dx = rx - posX;
    const dy = ry - posY;

    const mag = Math.sqrt(dx * dx + dy * dy) * 2.1;

    ripple.style.width = `${mag}px`;
    ripple.style.height = `${mag}px`;
  } else {
    ripple.style.position = 'absolute';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.width = `${maxDimension}px`;
    ripple.style.height = `${maxDimension}px`;
  }

  containerElement.appendChild(ripple);

  setTimeout(() => ripple.classList.remove(styles.entering), 0);
  return ripple;
}

function removeRipple(ripple: HTMLDivElement | null) {
  if (!ripple) return;
  ripple.classList.add(styles.leaving);

  setTimeout(() => ripple.remove(), 500);
}

export function useRipple(props: RippleBaseProps = {}) {
  const rippleRef = useRef<HTMLDivElement | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const propsRef = useRef(props);
  useLayoutEffect(() => {
    propsRef.current = props;
  });

  useLayoutEffect(() => {
    if (targetElement) {
      const mouseUp = () => {
        removeRipple(rippleRef.current);
        rippleRef.current = null;
      };

      const mouseDown = (ev: MouseEvent) => {
        const { noRipple, centered, target } = propsRef.current;

        if (!noRipple) {
          removeRipple(rippleRef.current);
          rippleRef.current = addRipple(
            target ? target.current : (ev.currentTarget as HTMLElement),
            centered ? null : { x: ev.clientX, y: ev.clientY },
          );
        }
      };

      targetElement.addEventListener('mouseup', mouseUp);
      targetElement.addEventListener('mousedown', mouseDown);
      targetElement.classList.add(styles.rippleContainer);

      return () => {
        targetElement.removeEventListener('mouseup', mouseUp);
        targetElement.removeEventListener('mousedown', mouseDown);
        targetElement.classList.remove(styles.rippleContainer);
        mouseUp();
      };
    }

    return undefined;
  }, [targetElement]);

  return setTargetElement;
}

export const Ripple = forwardRef<HTMLElement, RippleComponentProps>(function _Ripple({ children, component: Component, ...props }, ref) {
  const ripple = useRipple(props);
  const mergedRef = useCallback(
    (val) => {
      ripple?.(val);

      if (typeof ref === 'function') {
        ref(val);
      } else if (ref) {
        ref.current = val;
      }
    },
    [ref, ripple],
  );

  if (Component) {
    return (
      <Component {...props} ref={mergedRef}>
        {children}
      </Component>
    );
  }

  if (!isElement(children)) {
    throw new Error('Children passed to <Ripple> must be an element with ref');
  }

  return cloneElement(children, {
    ...(children.props as any),
    ref: mergedRef,
  });
}) as FC<RippleComponentProps>;
