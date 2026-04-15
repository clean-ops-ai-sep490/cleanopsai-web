import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Siren, CheckCircle2 } from "lucide-react";
import { EmergencyAlert } from "./types";

interface EmergencyBannerProps {
  emergency: EmergencyAlert;
  onResolve: (id: string) => void;
}

export function EmergencyBanner({
  emergency,
  onResolve,
}: EmergencyBannerProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <Siren className="w-6 h-6 text-red-600 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-600">CẢNH BÁO KHẨN CẤP</p>
            <p className="text-sm text-gray-700">
              {emergency.note} — {emergency.worker} tại {emergency.location}
            </p>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onResolve(emergency.id)}
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Đã xử lý
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
