export function getRouteByRole(role: string | number | null | undefined): string {
  const roleStr = String(role ?? "").trim().toLowerCase();
  if (roleStr === "4" || roleStr === "supporter") return "/support/equipments";
  if (roleStr === "0" || roleStr === "admin") return "/admin/users";
  return "/manager";
}
