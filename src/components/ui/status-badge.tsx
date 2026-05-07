"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        secondary: "bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface StatusBadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: string;
}

export function StatusBadge({
  status,
  variant,
  className,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(statusBadgeVariants({ variant }), className)}
      {...props}
    >
      {status}
    </span>
  );
}
