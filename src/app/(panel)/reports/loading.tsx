import { Skeleton, SkeletonKpi } from "@/components/Skeleton";

export default function ReportsLoading() {
  return (
    <>
      <div className="card mb-6 flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-28 rounded-2xl" />
      </div>

      {/* Customer filter */}
      <div className="card mb-6 flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-2xl" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 flex-1" />
      </div>

      {/* Date nav */}
      <div className="card mb-6 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonKpi key={i} />
        ))}
      </div>

      {/* Top items */}
      <div className="card">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}