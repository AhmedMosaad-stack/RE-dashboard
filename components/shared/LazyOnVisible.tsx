'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyOnVisibleProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  className?: string;
}

export function LazyOnVisible({
  children,
  fallback = null,
  rootMargin = '0px',
  className,
}: LazyOnVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          // Yield to main thread before loading heavy components to avoid TBT
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => setVisible(true), { timeout: 1000 });
          } else {
            setTimeout(() => setVisible(true), 100);
          }
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}
