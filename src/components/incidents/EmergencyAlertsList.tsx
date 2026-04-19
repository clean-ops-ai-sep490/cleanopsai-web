import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Siren, CheckCircle2, MapPin, Clock } from "lucide-react";
import { EmergencyAlert } from "./types";

interface EmergencyAlertsListProps {
  emergencies: EmergencyAlert[];
  onResolve: (id: string) => void;
}

export function EmergencyAlertsList({
  emergencies,
  onResolve,
}: EmergencyAlertsListProps) {
  return (
    <div className="space-y-4">
      {emergencies.map((em) => {
        const isActive = em.status === "active";
        return (
          <Card key={em.id} className={isActive ? "border-red-200" : ""}>
            <CardContent className="p-4 border rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-red-100" : "bg-gray-100"
                    }`}
                  >
                    <Siren
                      className={`w-5 h-5 ${
                        isActive
                          ? "text-red-600 animate-pulse"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-black">
                        {em.worker}
                      </p>
                      <span className="text-xs font-mono text-gray-500">
                        {em.id}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {em.location} · <Clock className="w-3 h-3" />
                      {em.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      isActive
                        ? "bg-red-100 text-red-800"
                        : em.status === "handling"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }
                  >
                    {isActive
                      ? "Đang hoạt động"
                      : em.status === "handling"
                        ? "Đang xử lý"
                        : "Đã giải quyết"}
                  </Badge>
                  {isActive && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onResolve(em.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Xử lý
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-black">{em.note}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
