/**
 * Recurrence constants and predefined options
 * Centralized configuration for recurring patterns
 */

import type { RecurrenceOption, WeekdayOption } from "@/types/recurrence";

// Recurrence type options
export const RECURRENCE_TYPES: RecurrenceOption[] = [
  { value: "Daily", label: "Hàng ngày" },
  { value: "Weekly", label: "Hàng tuần" },
  { value: "Monthly", label: "Hàng tháng" },
  { value: "Yearly", label: "Hàng năm" },
];

// Weekday options with Vietnamese labels
export const WEEKDAY_OPTIONS: WeekdayOption[] = [
  { id: "Monday", label: "Thứ 2", shortLabel: "T2" },
  { id: "Tuesday", label: "Thứ 3", shortLabel: "T3" },
  { id: "Wednesday", label: "Thứ 4", shortLabel: "T4" },
  { id: "Thursday", label: "Thứ 5", shortLabel: "T5" },
  { id: "Friday", label: "Thứ 6", shortLabel: "T6" },
  { id: "Saturday", label: "Thứ 7", shortLabel: "T7" },
  { id: "Sunday", label: "Chủ nhật", shortLabel: "CN" },
];

// Month names in Vietnamese
export const MONTH_NAMES: string[] = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

// Default time slot
export const DEFAULT_TIME_SLOT = "09:00";

// Maximum days in a month (for grid generation)
export const MAX_DAYS_IN_MONTH = 31;

// Utility function to get number of days in a specific month
export const getDaysInMonth = (month: number, year?: number): number => {
  // Use current year if not provided
  const currentYear = year || new Date().getFullYear();

  // Create date object for the first day of next month, then subtract 1 day
  return new Date(currentYear, month, 0).getDate();
};

// Utility function to get days array for a specific month
export const getDaysArrayForMonth = (
  month: number,
  year?: number,
): number[] => {
  const daysCount = getDaysInMonth(month, year);
  return Array.from({ length: daysCount }, (_, i) => i + 1);
};
