import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

export function AppShell({
  sidebar,
  header,
  children,
  contentClassName,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      {sidebar}
      {header}
      <main
        className={cn(
          "min-h-screen px-6 py-6 md:px-8 md:py-8 lg:px-10",
          contentClassName,
        )}
        style={{
          marginLeft: "var(--app-sidebar-width)",
          paddingTop: "calc(var(--app-header-height) + 24px)"
        }}
      >
        <div className="mx-auto w-full max-w-[var(--app-max-content)] animate-rise-in">
          {children}
        </div>
      </main>
    </div>
  );
}
