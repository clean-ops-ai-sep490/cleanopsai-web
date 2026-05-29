"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { User, ShieldAlert, Award, FileText } from "lucide-react";
import type { WorkerSearchResult } from "@/types/worker-search";

interface WorkerSearchResultsTableProps {
  data: WorkerSearchResult[];
  isLoading: boolean;
}

export function WorkerSearchResultsTable({
  data,
  isLoading,
}: WorkerSearchResultsTableProps) {
  const columns = [
    {
      header: "Công nhân",
      headerClassName: "pl-6",
      className: "pl-6 font-bold text-slate-900",
      cell: (worker: WorkerSearchResult) => (
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="border border-slate-100 bg-slate-50">
            <AvatarImage
              src={worker.avatarUrl || undefined}
              alt={worker.fullName}
              className="object-cover"
            />
            <AvatarFallback className="bg-teal-50 text-teal-600 font-semibold text-sm">
              {worker.fullName ? worker.fullName.charAt(0) : <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-sm">
              {worker.fullName || "Chưa cập nhật tên"}
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              ID: {worker.id.substring(0, 8)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Địa chỉ",
      className: "max-w-[280px]",
      cell: (worker: WorkerSearchResult) => (
        <span 
          className="text-sm text-slate-600 font-medium line-clamp-2"
          title={worker.displayAddress}
        >
          {worker.displayAddress || "—"}
        </span>
      ),
    },
    {
      header: "Kỹ năng",
      className: "max-w-[320px]",
      cell: (worker: WorkerSearchResult) => {
        const skillsList = worker.skills || [];
        if (skillsList.length === 0) {
          return <span className="text-xs text-slate-400 italic">Không có kỹ năng</span>;
        }

        const visibleSkills = skillsList.slice(0, 3);
        const extraCount = worker.totalSkills - visibleSkills.length;

        return (
          <div className="flex flex-wrap gap-1.5">
            {visibleSkills.map((skill, index) => (
              <Badge 
                key={skill.id + "-" + index} 
                variant="info" 
                className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
              >
                {skill.name || "Kỹ năng chưa đặt tên"}
              </Badge>
            ))}
            {extraCount > 0 && (
              <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] text-slate-400 font-bold">
                +{extraCount} khác
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: "Chứng chỉ",
      className: "max-w-[320px]",
      cell: (worker: WorkerSearchResult) => {
        const certsList = worker.certifications || [];
        if (certsList.length === 0) {
          return <span className="text-xs text-slate-400 italic">Không có chứng chỉ</span>;
        }

        const visibleCerts = certsList.slice(0, 2);
        const extraCount = worker.totalCertifications - visibleCerts.length;

        return (
          <div className="flex flex-wrap gap-1.5">
            {visibleCerts.map((cert, index) => {
              const isExpired = cert.expiredAt ? new Date(cert.expiredAt) < new Date() : false;
              return (
                <Badge
                  key={cert.id + "-" + index}
                  variant={isExpired ? "destructive" : "success"}
                  className="rounded-md px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1"
                >
                  <Award className="h-3 w-3 shrink-0" />
                  <span>{cert.name || "Chứng chỉ chưa đặt tên"}</span>
                  {isExpired && <span className="text-[8px] font-bold uppercase">(Hết hạn)</span>}
                </Badge>
              );
            })}
            {extraCount > 0 && (
              <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[10px] text-slate-400 font-bold">
                +{extraCount} khác
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage="Nhập từ khóa tìm kiếm ở trên để tìm công nhân phù hợp"
    />
  );
}
