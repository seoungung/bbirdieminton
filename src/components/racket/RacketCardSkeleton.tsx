export function RacketCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 w-12 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-3 w-3/4 bg-muted rounded" />
        <div className="flex gap-1">
          <div className="h-4 w-12 bg-muted rounded-full" />
          <div className="h-4 w-10 bg-muted rounded-full" />
        </div>
        <div className="flex justify-between pt-1">
          <div className="h-3 w-8 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

export function RacketGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <RacketCardSkeleton key={i} />
      ))}
    </div>
  )
}
