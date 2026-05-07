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
import { Clock, Plus, X, AlertCircle } from "lucide-react";

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
  daysOfMonth,
  setDaysOfMonth,
  newTime,
  setNewTime,
  toggleDayOfWeek,
}: RecurrenceSectionProps) {
  const recurrenceType = formData.recurrenceType;
  const isInherited = !!formData.slaTaskId;

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
    if (isInherited) return;
    toggleDayOfWeek(weekdayId);
  };

  const toggleDay = (day: number) => {
    if (isInherited) return;
    if (daysOfMonth.includes(day)) {
      setDaysOfMonth(daysOfMonth.filter((d) => d !== day));
    } else {
      setDaysOfMonth([...daysOfMonth, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">
              Loại lặp lại <span className="text-red-500">*</span>
            </Label>
            {isInherited && (
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {/* <Clock className="w-3 h-3" />
                Kế thừa từ SLA */}
              </div>
            )}
          </div>
          <Select
            onValueChange={(value) => updateField("recurrenceType", value)}
            value={recurrenceType || "Daily"}
            disabled={isInherited}
          >
            <SelectTrigger className="bg-white border-[#e5e5e5] disabled:opacity-80 disabled:bg-gray-50">
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
            <p className="text-xs text-red-500">{errors.recurrenceType}</p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="font-semibold">Thời điểm bắt đầu task (Times)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {times.map((time, index) => (
              <div key={`${index}`} className="space-y-1.5">
                {isInherited && (
                  <Label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Mốc giờ {index + 1}
                  </Label>
                )}
                <div
                  className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 group transition-all hover:border-primary/30"
                >
                  <div className="flex-1">
                    <TimePicker
                      value={time}
                      onChange={(newVal) => updateTimeSlot(time, newVal)}
                      format="24"
                      className="border-none bg-transparent h-8 shadow-none focus-visible:ring-0"
                    />
                  </div>
                  {!isInherited && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(time)}
                      className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={times.length <= 1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!isInherited && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-dashed border-2 h-[46px] text-gray-500 hover:text-primary hover:border-primary"
                onClick={addTimeSlot}
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm khung giờ
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {isInherited 
              ? `Số lượng khung giờ (${times.length}) được cố định theo cấu hình SLA.`
              : "Mỗi mốc giờ là thời điểm task bắt đầu; hệ thống sẽ kiểm tra theo thời lượng thực hiện (duration)."}
          </p>
          {errors.times && <p className="text-xs text-red-500">{errors.times}</p>}
        </div>

        {recurrenceType === "Weekly" && (
          <div className="space-y-3">
            <Label className="font-semibold text-gray-700">Các ngày trong tuần</Label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {WEEKDAY_OPTIONS.map((weekday) => {
                const isSelected = selectedDaysOfWeek.includes(weekday.id);
                return (
                  <button
                    key={weekday.id}
                    type="button"
                    onClick={() => toggleWeekday(weekday.id)}
                    disabled={isInherited}
                    className={`px-2 py-3 rounded-lg font-medium transition-all text-center border ${
                      isSelected
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    } ${isInherited && isSelected ? "opacity-90 ring-2 ring-primary/20" : ""} ${isInherited && !isSelected ? "opacity-40" : ""}`}
                  >
                    <div className="text-[10px] mb-0.5 opacity-80 uppercase tracking-tighter">
                      {weekday.shortLabel}
                    </div>
                    <div className="text-xs">{weekday.label}</div>
                  </button>
                );
              })}
            </div>
            {errors.daysOfWeek && (
              <p className="text-xs text-red-500">{errors.daysOfWeek}</p>
            )}
          </div>
        )}

        {recurrenceType === "Monthly" && (
          <div className="space-y-3">
            <Label className="font-semibold text-gray-700">Các ngày trong tháng</Label>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: MAX_DAYS_IN_MONTH }, (_, i) => i + 1).map(
                (day) => {
                  const isSelected = daysOfMonth.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      disabled={isInherited}
                      className={`aspect-square text-xs rounded-md font-medium transition-all border ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      } ${isInherited && isSelected ? "opacity-90 ring-1 ring-primary/20" : ""} ${isInherited && !isSelected ? "opacity-40" : ""}`}
                    >
                      {day}
                    </button>
                  );
                },
              )}
            </div>
            {errors.daysOfMonth && (
              <p className="text-xs text-red-500">{errors.daysOfMonth}</p>
            )}
          </div>
        )}

        {recurrenceType === "Yearly" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">
                  Chọn tháng
                </Label>
                <Select
                  onValueChange={(value) => {
                    updateField("selectedMonth", parseInt(value));
                    setDaysOfMonth([]);
                  }}
                  value={(formData.selectedMonth || 1).toString()}
                  disabled={isInherited}
                >
                  <SelectTrigger className="bg-white border-[#e5e5e5] disabled:opacity-80">
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
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-gray-500 uppercase">
                Chọn ngày
              </Label>
              <div className="grid grid-cols-7 gap-1.5">
                {getDaysArrayForMonth(formData.selectedMonth || 1).map((day) => {
                  const isSelected = daysOfMonth.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      disabled={isInherited}
                      className={`aspect-square text-xs rounded-md font-medium transition-all border ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      } ${isInherited && isSelected ? "opacity-90 ring-1 ring-primary/20" : ""} ${isInherited && !isSelected ? "opacity-40" : ""}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            {errors.monthDays && (
              <p className="text-xs text-red-500">{errors.monthDays}</p>
            )}
          </div>
        )}

        {isInherited && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 mt-4">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Bạn đang sử dụng cấu hình lặp lại cố định từ SLA. Chỉ có thể thay đổi
              mốc thời gian bắt đầu task trong ngày.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
