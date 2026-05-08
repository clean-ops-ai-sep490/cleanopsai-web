import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumbs?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  icon,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumbs ? <div>{breadcrumbs}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="mt-1 flex-shrink-0 text-slate-400">
              {icon}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
            {description ? (
              <p className="max-w-3xl text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
