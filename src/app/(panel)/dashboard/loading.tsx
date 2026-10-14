import { Skeleton, SkeletonKpi } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <>
      {/* Header */}
      <div className="card mb-6 flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-32" />
      </div>

      <div className="flex flex-col gap-4">
        {/* Greeting banner */}
        <div className="card flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="w-14 h-14 rounded-3xl shrink-0" />
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="flex items-center gap-2.5 mb-4">
            <Skeleton className="w-9 h-9 rounded-2xl" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonKpi key={i} />
          ))}
        </div>

        {/* Chart */}
        <div className="card">
          <div className="flex items-center gap-2.5 mb-4">
            <Skeleton className="w-9 h-9 rounded-2xl" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-[260px] w-full rounded-2xl" />
        </div>
      </div>
    </>
  );
}