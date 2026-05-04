import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("complete") ||
    normalized.includes("done") ||
    normalized.includes("success")
  ) {
    return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{status}</Badge>;
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("progress") ||
    normalized.includes("processing")
  ) {
    return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">{status}</Badge>;
  }

  if (
    normalized.includes("error") ||
    normalized.includes("fail") ||
    normalized.includes("overdue") ||
    normalized.includes("block")
  ) {
    return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50">{status}</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
}
