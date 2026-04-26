"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Clock } from "lucide-react";

// Import types and constants
import type { RecurrenceSectionProps } from "@/types/recurrence";
import {
  RECURRENCE_TYPES,
  WEEKDAY_OPTIONS,
  MONTH_NAMES,
  DEFAULT_TIME_SLOT,
  MAX_DAYS_IN_MONTH,
  getDaysArrayForMonth,
} from "@/constants/recurrence";

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
    if (selectedDaysOfWeek.includes(weekdayId)) {
      setSelectedDaysOfWeek(selectedDaysOfWeek.filter((d) => d !== weekdayId));
    } else {
      setSelectedDaysOfWeek([...selectedDaysOfWeek, weekdayId]);
    }
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
        <h2 className="text-lg font-semibold text-black mb-4">
          Cấu hình lặp lại
        </h2>

        <div className="space-y-6">
          {/* Loại lặp lại */}
          <div className="space-y-2">
            <Label>
              Loại lặp lại <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("recurrenceType", value)}
              defaultValue="Daily"
            >
              <SelectTrigger className="bg-white border-[#e5e5e5] focus:ring-2 focus:ring-[#1a80a2] focus:border-transparent">
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
                {(errors.recurrenceType as any)?.message ||
                  "Vui lòng chọn loại lặp lại"}
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
                      onChange={(newTime) => updateTimeSlot(time, newTime)}
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
                          ? "bg-[#1a80a2] text-white hover:bg-[#1a80a2]/90"
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
                            ? "bg-[#1a80a2] text-white hover:bg-[#1a80a2]/90"
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
                    setValue("selectedMonth", parseInt(value));
                    // Clear selected days when month changes since different months have different day counts
                    setDaysOfMonth([]);
                  }}
                  defaultValue="1"
                >
                  <SelectTrigger className="bg-white border-[#e5e5e5] focus:ring-2 focus:ring-[#1a80a2] focus:border-transparent">
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
                  {getDaysArrayForMonth(watch("selectedMonth") || 1).map(
                    (day) => {
                      const isSelected = daysOfMonth.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`aspect-square rounded-lg font-medium transition-all ${
                            isSelected
                              ? "bg-[#1a80a2] text-white hover:bg-[#1a80a2]/90"
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
