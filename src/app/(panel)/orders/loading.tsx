import { Skeleton } from "@/components/Skeleton";

export default function OrdersLoading() {
  return (
    <>
      <div className="card mb-6 flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-32 rounded-2xl" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-28" />
            </div>
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </>
  );
}