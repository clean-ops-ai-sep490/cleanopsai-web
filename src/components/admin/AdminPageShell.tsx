import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export { PageHeader, FilterBar, SectionCard, EmptyState, ErrorState, ConfirmDialog };

export function AdminPageShell({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}
