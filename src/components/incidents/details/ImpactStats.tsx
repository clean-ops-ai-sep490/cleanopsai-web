"use client";

interface ImpactStatsProps {
  inProgressCount: number;
  totalCount: number;
}

export function ImpactStats({ inProgressCount, totalCount }: ImpactStatsProps) {
  return (
    <div className="flex items-center gap-12 py-6 border-y border-slate-100">
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đang thực hiện</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{inProgressCount}</p>
      </div>
      <div className="h-10 w-px bg-slate-100" />
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tổng số Task</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
      </div>
    </div>
  );
}
