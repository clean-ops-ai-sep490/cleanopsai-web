"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = 40,
  color = "var(--app-primary)",
  className,
  label,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div
        className="animate-spin rounded-full border-4 border-transparent"
        style={{
          width: size,
          height: size,
          borderTopColor: color,
          borderRightColor: color,
          borderBottomColor: color,
        }}
      />

      {label && (
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}

export function FullPageLoading({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <LoadingSpinner size={50} label={label} />
    </div>
  );
}
