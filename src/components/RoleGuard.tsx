"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

// Role enum matching API
export enum UserRole {
  Worker = "1",
  Admin = "2",
  Manager = "3",
  Supervisor = "4",
  Supporter = "5",
}

// Map role names to role IDs - handle all possible formats
const ROLE_MAP: Record<string, UserRole> = {
  // Numeric string format
  "1": UserRole.Worker,
  "2": UserRole.Admin,
  "3": UserRole.Manager,
  "4": UserRole.Supervisor,
  "5": UserRole.Supporter,
  // Text format - exact case (from backend)
  Admin: UserRole.Admin,
  Manager: UserRole.Manager,
  Supervisor: UserRole.Supervisor,
  Worker: UserRole.Worker,
  Supporter: UserRole.Supporter,

  // Text format - lowercase
  admin: UserRole.Admin,
  manager: UserRole.Manager,
  supervisor: UserRole.Supervisor,
  worker: UserRole.Worker,
  supporter: UserRole.Supporter,

};

// Normalize role to UserRole enum
function normalizeRole(
  role: string | number | undefined,
): UserRole | undefined {
  if (role === undefined || role === null) return undefined;

  const roleStr = String(role).trim();

  // Try exact match first
  if (ROLE_MAP[roleStr]) {
    return ROLE_MAP[roleStr];
  }

  // Try lowercase match as fallback
  const lowerRole = roleStr.toLowerCase();
  if (ROLE_MAP[lowerRole]) {
    return ROLE_MAP[lowerRole];
  }

  return undefined;
}

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

import { FullPageLoading } from "@/components/ui/loading-spinner";

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = "/unauthorized",
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      const normalizedRole = normalizeRole(user.role);

      // Debug logging
      console.log("=== RoleGuard Debug ===");
      console.log("User object:", user);
      console.log("Raw user.role:", user.role, `(type: ${typeof user.role})`);
      console.log("Normalized role:", normalizedRole);
      console.log("Allowed roles:", allowedRoles);
      console.log(
        "Has permission:",
        normalizedRole && allowedRoles.includes(normalizedRole),
      );
      console.log("======================");

      const hasPermission =
        normalizedRole && allowedRoles.includes(normalizedRole);

      if (!hasPermission) {
        console.log("❌ Access denied, redirecting to:", fallbackPath);
        router.replace(fallbackPath);
      } else {
        console.log("✅ Access granted");
      }
    }
  }, [user, isLoading, allowedRoles, fallbackPath, router]);

  if (isLoading) {
    return <FullPageLoading label="Đang kiểm tra quyền truy cập..." />;
  }


  const normalizedRole = normalizeRole(user?.role);
  if (!user || !normalizedRole || !allowedRoles.includes(normalizedRole)) {
    return null;
  }

  return <>{children}</>;
}
