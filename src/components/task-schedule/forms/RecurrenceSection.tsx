"use client";

import { UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";

interface RecurrenceSectionProps {
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors<any>;
  times: string[];
  setTimes: (times: string[]) => void;
  selectedDaysOfWeek: string[];
  setSelectedDaysOfWeek: (days: string[]) => void;
  daysOfMonth: number[];
  setDaysOfMonth: (days: number[]) => void;
  newTime: string;
  setNewTime: (time: string) => void;
  newDayOfMonth: string;
  setNewDayOfMonth: (day: string) => void;
  addTime: () => void;
  removeTime: (time: string) => void;
  addDayOfMonth: () => void;
  removeDayOfMonth: (day: number) => void;
  toggleDayOfWeek: (day: string) => void;
}

const recurrenceTypes = [
  { value: "Daily", label: "Hàng ngày" },
  { value: "Weekly", label: "Hàng tuần" },
  { value: "Monthly", label: "Hàng tháng" },
  { value: "Yearly", label: "Hàng năm" },
];

const daysOfWeek = [
  { value: "Sunday", label: "Chủ nhật" },
  { value: "Monday", label: "Thứ hai" },
  { value: "Tuesday", label: "Thứ ba" },
  { value: "Wednesday", label: "Thứ tư" },
  { value: "Thursday", label: "Thứ năm" },
  { value: "Friday", label: "Thứ sáu" },
  { value: "Saturday", label: "Thứ bảy" },
];

export function RecurrenceSection({
  setValue,
  watch,
  errors,
  times,
  setTimes,
  selectedDaysOfWeek,
  setSelectedDaysOfWeek,
  daysOfMonth,
  setDaysOfMonth,
  newTime,
  setNewTime,
  newDayOfMonth,
  setNewDayOfMonth,
  addTime,
  removeTime,
  addDayOfMonth,
  removeDayOfMonth,
  toggleDayOfWeek,
}: RecurrenceSectionProps) {
  const recurrenceType = watch("recurrenceType");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">
          Cấu hình lặp lại
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Loại lặp lại *</Label>
            <Select
              onValueChange={(value) => setValue("recurrenceType", value)}
              defaultValue="Daily"
            >
              <SelectTrigger className="bg-white border-[#e5e5e5]">
                <SelectValue placeholder="Chọn loại lặp lại" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.recurrenceType && (
              <p className="text-sm text-red-500">
                {errors.recurrenceType.message}
              </p>
            )}
          </div>

          {/* Times Configuration */}
          <Card className="p-4 bg-gray-50">
            <Label className="text-sm font-medium">Thời gian trong ngày</Label>
            <div className="mt-2 space-y-3">
              <div className="flex flex-wrap gap-2">
                {times.map((time) => (
                  <Badge
                    key={time}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {time}
                    <button
                      type="button"
                      onClick={() => removeTime(time)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-32"
                />
                <Button
                  type="button"
                  onClick={addTime}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Days of Week (for Weekly) */}
          {recurrenceType === "Weekly" && (
            <Card className="p-4 bg-gray-50">
              <Label className="text-sm font-medium">Ngày trong tuần</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={
                      selectedDaysOfWeek.includes(day.value)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => toggleDayOfWeek(day.value)}
                    className="text-xs"
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Days of Month (for Monthly) */}
          {recurrenceType === "Monthly" && (
            <Card className="p-4 bg-gray-50">
              <Label className="text-sm font-medium">Ngày trong tháng</Label>
              <div className="mt-2 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {daysOfMonth.map((day) => (
                    <Badge
                      key={day}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      Ngày {day}
                      <button
                        type="button"
                        onClick={() => removeDayOfMonth(day)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={newDayOfMonth}
                    onChange={(e) => setNewDayOfMonth(e.target.value)}
                    placeholder="Ngày (1-31)"
                    className="w-32"
                  />
                  <Button
                    type="button"
                    onClick={addDayOfMonth}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
