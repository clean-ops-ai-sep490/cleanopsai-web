import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}

const toneClass: Record<NonNullable<StatsCardProps["tone"]>, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-blue-50 text-blue-700",
};

export function StatsCard({
  label,
  value,
  helper,
  icon,
  tone = "default",
}: StatsCardProps) {
  return (
    <Card className="border border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            {helper ? <p className="text-sm text-slate-500">{helper}</p> : null}
          </div>
          {icon ? (
            <div className={cn("rounded-[var(--app-radius-sm)] p-3", toneClass[tone])}>{icon}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
