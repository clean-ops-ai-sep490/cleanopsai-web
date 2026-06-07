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

export function CardGridSkeleton({ cards = 9 }: { cards?: number }) {
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <Skeleton className="h-11 w-80 rounded-xl" />

      {/* Card grid — matches grid-cols-1 md:grid-cols-2 xl:grid-cols-3 */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
          >
            {/* Card header: title + badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            {/* 3 key-value rows */}
            <div className="space-y-3 pt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>

            {/* 2 action buttons */}
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 flex-1 rounded-lg" />
              <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SLADetailPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <Skeleton className="h-9 w-52 rounded-lg" />

      {/* 3-column grid: 2 main + 1 sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — col-span-2 */}
        <div className="lg:col-span-2 space-y-6">
          {/* SLA info card */}
          <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <Skeleton className="h-6 w-40 mb-5" />
            <div className="grid grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-20 w-full rounded-lg mt-6" />
          </div>

          {/* Shifts card */}
          <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-36" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Tasks card */}
          <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar — col-span-1 */}
        <div className="space-y-6">
          <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <Skeleton className="h-6 w-24 mb-5" />
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="h-9 w-14 rounded" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
