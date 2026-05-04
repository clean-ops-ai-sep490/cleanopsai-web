import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <Card className="rounded-[20px] border-dashed border-slate-200 bg-white/80 shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:px-10">
        {icon ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            {icon}
          </div>
        ) : null}
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        {actionLabel && onAction ? (
          <Button onClick={onAction}>{actionLabel}</Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
