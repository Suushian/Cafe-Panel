import { Skeleton, SkeletonCard } from "@/components/Skeleton";

export default function CustomersLoading() {
  return (
    <>
      <div className="card mb-6 flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-32 rounded-2xl" />
      </div>

      <div className="card mb-6 flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-2xl" />
        <Skeleton className="h-4 flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}