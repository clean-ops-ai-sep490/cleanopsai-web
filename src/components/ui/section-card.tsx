import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn("border border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)]", className)}>
      {(title || description || action) && (
        <CardHeader className="border-b border-slate-200/70 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              {title ? (
                <CardTitle className="text-base font-semibold text-slate-950">
                  {title}
                </CardTitle>
              ) : null}
              {description ? (
                <p className="text-sm text-slate-500">{description}</p>
              ) : null}
            </div>
            {action ? <div>{action}</div> : null}
          </div>
        </CardHeader>
      )}
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}
