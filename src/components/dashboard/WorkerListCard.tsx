"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, TrendingUp } from "lucide-react";
import type { TopWorker } from "@/types/dashboard";

interface WorkerListCardProps {
  workers: TopWorker[];
}

export function WorkerListCard({ workers }: WorkerListCardProps) {
  const maxTasks = workers.length > 0 ? Math.max(...workers.map(w => w.totalTasks)) : 0;

  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Top nhân viên</CardTitle>
            <CardDescription className="text-sm text-slate-500">Những nhân viên có năng suất làm việc cao nhất.</CardDescription>
          </div>
          <div className="rounded-lg p-2 bg-green-50 text-green-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {workers.length === 0 ? (
          <EmptyState
            title="Chưa có dữ liệu"
            description="Danh sách nhân viên sẽ hiển thị khi có dữ liệu năng suất."
            icon={<Users className="h-10 w-10 text-slate-300" />}
          />
        ) : (
          <div className="space-y-4">
            {workers.map((worker) => {
              const percentage = maxTasks > 0 ? (worker.totalTasks / maxTasks) * 100 : 0;
              
              return (
                <div key={worker.workerId} className="group">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                        {worker.workerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-slate-900">{worker.totalTasks}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Tasks</span>
                    </div>
                  </div>
                  
                  <div className="relative h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-in-out bg-green-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
