import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Đang tải dữ liệu..." }: LoadingStateProps) {
  return (
    <Card className="rounded-[20px] border border-slate-200/80 bg-white/90">
      <CardContent className="flex items-center justify-center gap-3 p-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
        <span>{label}</span>
      </CardContent>
    </Card>
  );
}
