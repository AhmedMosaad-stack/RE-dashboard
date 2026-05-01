import { Inbox, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="border-border bg-card flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <div className="bg-muted text-muted-foreground rounded-full p-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>
    </div>
  );
}
