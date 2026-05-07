import { useAuth } from "@/contexts/AuthContext";

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

export function useRole() {
  const { user } = useAuth();
  const normalizedRole = normalizeRole(user?.role);

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!normalizedRole) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(normalizedRole);
  };

  const isAdmin = () => hasRole(UserRole.Admin);
  const isManager = () => hasRole(UserRole.Manager);
  const isSupervisor = () => hasRole(UserRole.Supervisor);
  const isWorker = () => hasRole(UserRole.Worker);
  const isSupporter = () => hasRole(UserRole.Supporter);
  // Web app access: Only Admin and Manager
  const canAccessWebApp = () => hasRole([UserRole.Admin, UserRole.Manager]);

  // Specific permissions based on product.md
  const canManageMasterData = () => isAdmin();
  const canManageUsers = () => isAdmin();
  const canConfigureAI = () => isAdmin();

  const canManageSLA = () => hasRole([UserRole.Admin, UserRole.Manager]);
  const canManageWorkflow = () => hasRole([UserRole.Admin, UserRole.Manager]);
  const canManageContracts = () => hasRole([UserRole.Admin, UserRole.Manager]);
  const canManageClients = () => hasRole([UserRole.Admin, UserRole.Manager]);
  const canSearchStaff = () => hasRole([UserRole.Admin, UserRole.Manager]);
  const canManageTaskSchedule = () =>
    hasRole([UserRole.Admin, UserRole.Manager]);
  const canViewIssueReports = () => hasRole([UserRole.Admin, UserRole.Manager]);

  return {
    user,
    role: normalizedRole, // ← Return normalized role ("1" instead of "Manager")
    rawRole: user?.role, // ← Keep raw role for debugging
    hasRole,
    isAdmin,
    isManager,
    isSupervisor,
    isWorker,
    isSupporter,
    canAccessWebApp,
    canManageMasterData,
    canManageUsers,
    canConfigureAI,
    canManageSLA,
    canManageWorkflow,
    canManageContracts,
    canManageClients,
    canSearchStaff,
    canManageTaskSchedule,
    canViewIssueReports,
  };
}
