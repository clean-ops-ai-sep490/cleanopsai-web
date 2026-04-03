"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Pause,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import Link from "next/link";
import type { SLATrigger } from "@/types/sla";

// Mock data - in real app this would come from API
const mockTrigger: SLATrigger = {
  id: "1",
  name: "Response Time Alert",
  type: "Response Time",
  condition: "Greater than",
  threshold: 30,
  unit: "minutes",
  status: "active",
  createdAt: "2024-01-15",
};

const mockMetrics = {
  totalTriggers: 15,
  triggersThisWeek: 3,
  averageValue: 27.5,
  complianceRate: 85.2,
  lastTriggered: "2024-01-20 14:30",
  triggerFrequency: "2-3 times per week",
};

const mockHistory = [
  {
    id: "1",
    date: "2024-01-20",
    time: "14:30",
    triggered: true,
    value: 35,
    threshold: 30,
    severity: "high",
    resolved: true,
  },
  {
    id: "2",
    date: "2024-01-19",
    time: "09:15",
    triggered: false,
    value: 25,
    threshold: 30,
    severity: "normal",
    resolved: true,
  },
  {
    id: "3",
    date: "2024-01-18",
    time: "16:45",
    triggered: true,
    value: 32,
    threshold: 30,
    severity: "medium",
    resolved: true,
  },
  {
    id: "4",
    date: "2024-01-17",
    time: "11:20",
    triggered: false,
    value: 28,
    threshold: 30,
    severity: "normal",
    resolved: true,
  },
  {
    id: "5",
    date: "2024-01-16",
    time: "13:10",
    triggered: false,
    value: 22,
    threshold: 30,
    severity: "normal",
    resolved: true,
  },
];

export default function SLATriggerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trigger] = useState<SLATrigger>(mockTrigger);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "inactive":
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "response time":
        return <Clock className="h-6 w-6 text-blue-600" />;
      case "resolution time":
        return <Target className="h-6 w-6 text-purple-600" />;
      case "quality score":
        return <TrendingUp className="h-6 w-6 text-green-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-orange-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "normal":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleToggleStatus = () => {
    // Toggle trigger status logic
    console.log("Toggle status for trigger:", trigger.id);
  };

  const handleDelete = () => {
    // Delete trigger logic
    if (confirm("Are you sure you want to delete this SLA trigger?")) {
      console.log("Delete trigger:", trigger.id);
      router.push("/dashboard/sla-trigger");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/sla-trigger">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to SLA Triggers
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              {getTypeIcon(trigger.type)}
              <div>
                <h1 className="text-2xl font-semibold text-black">
                  {trigger.name}
                </h1>
                <p className="text-gray-600">
                  ID: {trigger.id} • Created: {trigger.createdAt}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleToggleStatus}
              className={
                trigger.status === "active"
                  ? "text-orange-600"
                  : "text-green-600"
              }
            >
              {trigger.status === "active" ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Disable
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Enable
                </>
              )}
            </Button>
            <Link href={`/dashboard/sla-trigger/${trigger.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuration Details */}
            <Card>
              <CardHeader>
                <CardTitle>Trigger Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Trigger Type
                    </label>
                    <p className="text-lg font-semibold text-black">
                      {trigger.type}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
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
                    <p className="text-lg font-semibold text-black">
                      {trigger.condition}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Threshold
                    </label>
                    <p className="text-lg font-semibold text-[#1a80a2]">
                      {trigger.threshold} {trigger.unit}
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Trigger Logic:
                  </h4>
                  <p className="text-blue-800">
                    Alert when <strong>{trigger.type}</strong> is{" "}
                    <strong>{trigger.condition.toLowerCase()}</strong>{" "}
                    <strong>
                      {trigger.threshold} {trigger.unit}
                    </strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            entry.triggered ? "bg-red-500" : "bg-green-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-black">
                            {entry.date} at {entry.time}
                          </p>
                          <p className="text-sm text-gray-600">
                            Value: {entry.value} {trigger.unit} (Threshold:{" "}
                            {entry.threshold})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={getSeverityColor(entry.severity)}
                        >
                          {entry.severity}
                        </Badge>
                        <Badge
                          variant={
                            entry.triggered ? "destructive" : "secondary"
                          }
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#1a80a2]">
                    {mockMetrics.totalTriggers}
                  </p>
                  <p className="text-sm text-gray-600">Total Triggers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {mockMetrics.triggersThisWeek}
                  </p>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {mockMetrics.averageValue}
                  </p>
                  <p className="text-sm text-gray-600">Average Value</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {mockMetrics.complianceRate}%
                  </p>
                  <p className="text-sm text-gray-600">Compliance Rate</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Last Triggered
                  </label>
                  <p className="text-sm font-semibold">
                    {mockMetrics.lastTriggered}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Frequency
                  </label>
                  <p className="text-sm font-semibold">
                    {mockMetrics.triggerFrequency}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Created Date
                  </label>
                  <p className="text-sm font-semibold">{trigger.createdAt}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
