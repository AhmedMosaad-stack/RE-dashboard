import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1
          className="font-marker"
          style={{ color: 'var(--ink)', fontSize: '2rem', lineHeight: 1.1 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-1 text-sm"
            style={{ fontFamily: "'Cabin', sans-serif", color: 'var(--ink-muted)' }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
