import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardPlus, Package, CheckCircle2, XCircle } from "lucide-react";
import { AdHocRequest } from "./types";
import { requestStatusConfig } from "./constants";

interface RequestsListProps {
  requests: AdHocRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function RequestsList({
  requests,
  onApprove,
  onReject,
}: RequestsListProps) {
  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const st = requestStatusConfig[req.status];
        const isEquipment = req.type === "equipment";
        return (
          <Card key={req.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isEquipment ? "bg-blue-100" : "bg-[#1a80a2]/10"
                  }`}
                >
                  {isEquipment ? (
                    <Package className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ClipboardPlus className="w-5 h-5 text-[#1a80a2]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-black truncate">
                      {req.description}
                    </p>
                    {req.urgency === "urgent" && (
                      <Badge variant="destructive">Khẩn</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {req.requester} ·{" "}
                    {isEquipment ? "Yêu cầu thiết bị" : "Ad-hoc Task"} ·{" "}
                    {req.createdAt}
                  </p>
                </div>
                <Badge className={`${st.className} shrink-0`}>{st.label}</Badge>
                {req.status === "pending" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" onClick={() => onApprove(req.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onReject(req.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Từ chối
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
