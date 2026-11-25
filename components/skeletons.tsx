function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted motion-reduce:animate-none ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="aspect-[16/9] animate-pulse bg-muted motion-reduce:animate-none" />
      <div className="space-y-2 p-3">
        <Bar className="h-5 w-40" />
        <Bar className="h-4 w-56" />
        <Bar className="h-4 w-32" />
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="mx-auto max-w-7xl pt-3 md:grid md:grid-cols-[320px_1fr] md:gap-8 md:px-8 md:pt-8">
      <div className="space-y-4 px-4 md:px-0">
        <Bar className="h-8 w-full" />
        <Bar className="h-36 w-full rounded-2xl" />
      </div>
      <div className="mt-4 grid gap-3 px-4 sm:grid-cols-2 md:mt-0 md:px-0 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl md:grid md:grid-cols-[1fr_400px] md:gap-8 md:px-8 md:pt-6">
      <div className="aspect-[4/3] animate-pulse bg-muted md:rounded-xl motion-reduce:animate-none" />
      <div className="space-y-3 px-4 pt-4 md:px-0 md:pt-9">
        <Bar className="h-7 w-48" />
        <Bar className="h-4 w-64" />
        <Bar className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}
