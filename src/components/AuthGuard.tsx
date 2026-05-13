"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { FullPageLoading } from "@/components/ui/loading-spinner";
import { useHasMounted } from "@/hooks/use-has-mounted";


export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const hasMounted = useHasMounted();
  const router = useRouter();

  useEffect(() => {
    if (hasMounted && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router, hasMounted]);

  // Always show loading until mounted on client to match server SSR
  if (!hasMounted || isLoading) {
    return <FullPageLoading label="Đang tải dữ liệu..." />;
  }


  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
