/**
 * Recurrence and Schedule related types
 * Used for task scheduling and recurring patterns
 */

import { UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";

// Recurrence types
export type RecurrenceType = "Daily" | "Weekly" | "Monthly" | "Yearly";

export interface RecurrenceOption {
  value: RecurrenceType;
  label: string;
}

// Weekday definitions
export interface WeekdayOption {
  id: string;
  label: string;
  shortLabel: string;
}

// Component props interface
export interface RecurrenceSectionProps {
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
