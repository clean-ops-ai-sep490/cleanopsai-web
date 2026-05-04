import { Skeleton } from "@/components/ui/skeleton";

export function ListPageSkeleton({
  cards = 3,
  rows = 6,
}: {
  cards?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-[28rem] max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-[20px]" />
        ))}
      </div>

      <Skeleton className="h-16 rounded-[20px]" />

      <div className="space-y-4 rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-[28rem] max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[280px] rounded-[20px] lg:col-span-1" />
        <Skeleton className="h-[280px] rounded-[20px] lg:col-span-2" />
      </div>
    </div>
  );
}

export function CalendarPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-14 rounded-[20px]" />
      <div className="space-y-3 rounded-[20px] border border-slate-200 bg-white p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[420px] w-full rounded-[16px]" />
      </div>
    </div>
  );
}
