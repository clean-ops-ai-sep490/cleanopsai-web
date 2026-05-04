"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

// Import constants
import {
  RECURRENCE_TYPES,
  WEEKDAY_OPTIONS,
  MONTH_NAMES,
  DEFAULT_TIME_SLOT,
  MAX_DAYS_IN_MONTH,
  getDaysArrayForMonth,
} from "@/constants/recurrence";

interface RecurrenceSectionProps {
  formData: any;
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
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

export function RecurrenceSection({
  formData,
  errors,
  updateField,
  times,
  setTimes,
  selectedDaysOfWeek,
  setSelectedDaysOfWeek,
  daysOfMonth,
  setDaysOfMonth,
  newTime,
  setNewTime,
  toggleDayOfWeek,
}: RecurrenceSectionProps) {
  const recurrenceType = formData.recurrenceType;

  // Helper functions for new UI
  const addTimeSlot = () => {
    const newSlot = newTime || DEFAULT_TIME_SLOT;
    if (!times.includes(newSlot)) {
      setTimes([...times, newSlot]);
      setNewTime("");
    }
  };

  const removeTimeSlot = (timeToRemove: string) => {
    if (times.length > 1) {
      setTimes(times.filter((time) => time !== timeToRemove));
    }
  };

  const updateTimeSlot = (oldTime: string, newTimeValue: string) => {
    setTimes(times.map((time) => (time === oldTime ? newTimeValue : time)));
  };

  const toggleWeekday = (weekdayId: string) => {
    toggleDayOfWeek(weekdayId);
  };

  const toggleDay = (day: number) => {
    if (daysOfMonth.includes(day)) {
      setDaysOfMonth(daysOfMonth.filter((d) => d !== day));
    } else {
      setDaysOfMonth([...daysOfMonth, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Cấu hình lặp lại</h2>
          <div className="flex items-center gap-2 text-sm text-primary">
            <Clock className="w-4 h-4" />
            <span>Cấu hình sẽ tự động điền từ SLA Task</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Loại lặp lại */}
          <div className="space-y-2">
            <Label>
              Loại lặp lại <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => updateField("recurrenceType", value)}
              value={recurrenceType || "Daily"}
            >
              <SelectTrigger className="bg-white border-[#e5e5e5] focus:ring-2 focus:ring-primary focus:border-transparent">
                <SelectValue placeholder="Chọn loại lặp lại" />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.recurrenceType && (
              <p className="text-sm text-red-500">
                {errors.recurrenceType}
              </p>
            )}
          </div>

          {/* Thời gian trong ngày */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">
              Thời gian trong ngày
            </Label>
            <div className="space-y-3">
              {times.map((time, index) => (
                <div
                  key={`${time}-${index}`}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1 max-w-xs">
                    <TimePicker
                      value={time}
                      onChange={(newTimeValue) => updateTimeSlot(time, newTimeValue)}
                      placeholder="Chọn thời gian"
                      format="24"
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly selector */}
          {recurrenceType === "Weekly" && (
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn các ngày trong tuần
              </Label>
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAY_OPTIONS.map((weekday) => {
                  const isSelected = selectedDaysOfWeek.includes(weekday.id);
                  return (
                    <button
                      key={weekday.id}
                      type="button"
                      onClick={() => toggleWeekday(weekday.id)}
                      className={`px-3 py-4 rounded-lg font-medium transition-all text-center ${
                        isSelected
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="text-xs mb-1 opacity-80">
                        {weekday.shortLabel}
                      </div>
                      <div className="text-sm">{weekday.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monthly selector */}
          {recurrenceType === "Monthly" && (
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn các ngày trong tháng
              </Label>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: MAX_DAYS_IN_MONTH }, (_, i) => i + 1).map(
                  (day) => {
                    const isSelected = daysOfMonth.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`aspect-square rounded-lg font-medium transition-all ${
                          isSelected
                            ? "bg-primary text-white hover:bg-primary/90"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* Yearly selector */}
          {recurrenceType === "Yearly" && (
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn tháng
                </Label>
                <Select
                  onValueChange={(value) => {
                    updateField("selectedMonth", parseInt(value));
                    // Clear selected days when month changes
                    setDaysOfMonth([]);
                  }}
                  value={(formData.selectedMonth || 1).toString()}
                >
                  <SelectTrigger className="bg-white border-[#e5e5e5] focus:ring-2 focus:ring-primary focus:border-transparent">
                    <SelectValue placeholder="Chọn tháng" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_NAMES.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn ngày
                </Label>
                <div className="grid grid-cols-7 gap-2">
                  {getDaysArrayForMonth(formData.selectedMonth || 1).map(
                    (day) => {
                      const isSelected = daysOfMonth.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`aspect-square rounded-lg font-medium transition-all ${
                            isSelected
                              ? "bg-primary text-white hover:bg-primary/90"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
