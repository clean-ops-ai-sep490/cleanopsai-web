export function getRouteByRole(role: string | number | null | undefined): string {
  const roleStr = String(role ?? "").trim().toLowerCase();
  if (roleStr === "4" || roleStr === "supervisor") return "/supervisor/ai-retrain";
  if (roleStr === "5" || roleStr === "supporter") return "/support/equipments";
  if (roleStr === "2" || roleStr === "admin") return "/admin/users";
  if (roleStr === "3" || roleStr === "manager") return "/manager";
  return "/unauthorized";
}


