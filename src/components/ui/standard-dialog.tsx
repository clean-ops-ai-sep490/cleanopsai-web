"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StandardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger?: ReactNode;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const maxWidthClasses = {
  sm: "sm:max-w-[500px]",
  md: "sm:max-w-[600px]",
  lg: "sm:max-w-[700px]",
  xl: "sm:max-w-[800px]",
};

export function StandardDialog({
  open,
  onOpenChange,
  title,
  trigger,
  children,
  maxWidth = "md",
  className = "",
}: StandardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={`${maxWidthClasses[maxWidth]} max-h-[80vh] overflow-y-auto !bg-white !border-0 !shadow-lg !ring-0 ${className}`}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
