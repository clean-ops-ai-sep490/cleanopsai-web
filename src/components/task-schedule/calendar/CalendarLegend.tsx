"use client";

import { Card } from "@/components/ui/card";

export function CalendarLegend() {
  const legends = [
    { color: "bg-blue-100 border-blue-300", label: "Vệ sinh văn phòng" },
    { color: "bg-purple-100 border-purple-300", label: "Vệ sinh sản xuất" },
    { color: "bg-green-100 border-green-300", label: "Vệ sinh phòng họp" },
    { color: "bg-orange-100 border-orange-300", label: "Vệ sinh ăn uống" },
    { color: "bg-pink-100 border-pink-300", label: "Vệ sinh nhà vệ sinh" },
  ];

  return (
    <Card className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-semibold text-black mb-3">Chú thích</h3>
      <div className="space-y-2">
        {legends.map((legend, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border ${legend.color}`} />
            <span className="text-xs text-gray-700">{legend.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
