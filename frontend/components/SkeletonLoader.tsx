'use client';

export function SkeletonLine({ className = 'h-4 w-full' }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} />;
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <SkeletonLine className="h-5 w-1/3" />
            <SkeletonLine className="h-8 w-8 rounded-xl" />
          </div>
          <SkeletonLine className="h-8 w-1/2" />
          <SkeletonLine className="h-3 w-3/4" />
        </div>
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <SkeletonLine className="h-5 w-1/4" />
        <SkeletonLine className="h-9 w-32 rounded-xl" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <SkeletonLine
                key={cIdx}
                className={`h-4 ${cIdx === 0 ? 'w-1/4' : cIdx === 1 ? 'w-1/3' : 'w-1/6'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
      <div className="space-y-2">
        <SkeletonLine className="h-6 w-1/3" />
        <SkeletonLine className="h-4 w-2/3" />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-1/4" />
          <SkeletonLine className="h-11 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-1/4" />
          <SkeletonLine className="h-24 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-1/3" />
          <SkeletonLine className="h-11 w-full rounded-xl" />
        </div>
      </div>
      <SkeletonLine className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-6">
      <SkeletonLine className="h-7 w-64" />
      <SkeletonLine className="h-4 w-96" />
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeaderSkeleton />

      {/* Top Banner Skeleton */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
        <SkeletonLine className="h-6 w-1/2" />
        <SkeletonLine className="h-4 w-3/4" />
        <div className="flex gap-4 pt-2">
          <SkeletonLine className="h-10 w-36 rounded-xl" />
          <SkeletonLine className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton count={3} />
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormSkeleton />
        <TableSkeleton rows={4} cols={3} />
      </div>
    </div>
  );
}
