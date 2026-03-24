import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ columns = 6, rows = 7 }: { columns?: number; rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`head-${index}`} className="h-8" />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton key={`cell-${rowIndex}-${columnIndex}`} className="h-14" />
          ))}
        </div>
      ))}
    </div>
  );
}
