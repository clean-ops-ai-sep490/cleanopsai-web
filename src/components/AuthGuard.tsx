"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { FullPageLoading } from "@/components/ui/loading-spinner";


export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <FullPageLoading label="Đang tải dữ liệu..." />;
  }


  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
