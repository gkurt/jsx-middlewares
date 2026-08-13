/** @jsxImportSource . */

import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import BrowserWindow from '../../components/BrowserWindow';

function Memoed({ children }: PropsWithChildren) {
  const a = useRef(0);

  return (
    <p>
      <span>{children}</span>
      <span>&nbsp;Render count: {++a.current}</span>
    </p>
  );
}

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((count) => count + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div>
      <p>Timer: {count}</p>

      <Memoed>This is not memoed.</Memoed>
      <Memoed $memo>This is memoed.</Memoed>
    </div>
  );
}

export default function IfDirectiveExample() {
  return (
    <BrowserWindow>
      <App />
    </BrowserWindow>
  );
}
