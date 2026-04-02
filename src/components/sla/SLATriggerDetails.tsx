"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { SLATrigger } from "@/types/sla";

interface SLATriggerDetailsProps {
  trigger: SLATrigger | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SLATriggerDetails({
  trigger,
  isOpen,
  onClose,
}: SLATriggerDetailsProps) {
  if (!trigger) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "response time":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "resolution time":
        return <Target className="h-5 w-5 text-purple-600" />;
      case "quality score":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
    }
  };

  // Mock data for trigger history and metrics
  const triggerHistory = [
    { date: "2024-01-20", triggered: true, value: 35, threshold: 30 },
    { date: "2024-01-19", triggered: false, value: 25, threshold: 30 },
    { date: "2024-01-18", triggered: true, value: 32, threshold: 30 },
    { date: "2024-01-17", triggered: false, value: 28, threshold: 30 },
    { date: "2024-01-16", triggered: false, value: 22, threshold: 30 },
  ];

  const metrics = {
    totalTriggers: 15,
    triggersThisWeek: 3,
    averageValue: 27.5,
    complianceRate: 85.2,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getTypeIcon(trigger.type)}
            {trigger.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trigger Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Type
                  </label>
                  <p className="text-sm font-semibold">{trigger.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(trigger.status)}
                    <Badge
                      variant={
                        trigger.status === "active" ? "default" : "secondary"
                      }
                      className={
                        trigger.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {trigger.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Condition
                  </label>
                  <p className="text-sm font-semibold">{trigger.condition}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Threshold
                  </label>
                  <p className="text-sm font-semibold">
                    {trigger.threshold} {trigger.unit}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Created
                  </label>
                  <p className="text-sm font-semibold">{trigger.createdAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1a80a2]">
                    {metrics.totalTriggers}
                  </p>
                  <p className="text-sm text-gray-600">Total Triggers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics.triggersThisWeek}
                  </p>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics.averageValue}
                  </p>
                  <p className="text-sm text-gray-600">Avg Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {metrics.complianceRate}%
                  </p>
                  <p className="text-sm text-gray-600">Compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {triggerHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          entry.triggered ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                      <span className="text-sm font-medium">{entry.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        Value: {entry.value} {trigger.unit}
                      </span>
                      <Badge
                        variant={entry.triggered ? "destructive" : "secondary"}
                        className={
                          entry.triggered
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {entry.triggered ? "Triggered" : "Normal"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-[#1a80a2] hover:bg-[#1a80a2]/90">
              Edit Trigger
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
