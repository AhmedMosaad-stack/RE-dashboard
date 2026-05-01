import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <Skeleton className="mt-4 h-8 w-32" />
        <Skeleton className="mt-2 h-3 w-20" />
      </CardContent>
    </Card>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="border-border bg-card rounded-lg border">
      <div className="border-border flex items-center gap-4 border-b px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`th-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-border divide-y">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={`row-${rowIdx}`} className="flex items-center gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton key={`cell-${rowIdx}-${colIdx}`} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
