import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function ErrorState({
  title,
  description,
  actionLabel = "Thử lại",
  onAction,
  icon,
}: ErrorStateProps) {
  return (
    <Card className="rounded-[20px] border-rose-200 bg-rose-50/60 shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:px-10">
        {icon ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            {icon}
          </div>
        ) : null}
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        {onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
      </CardContent>
    </Card>
  );
}
