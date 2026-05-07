import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Date utilities for API calls
 */

/**
 * Get start of day (00:00:00.000) for a given date in UTC
 * @param date - The date to get start of day for
 * @returns ISO string representing start of day in UTC (e.g., "2026-04-29T00:00:00.000Z")
 */
export function getStartOfDay(date: Date): string {
  // Create a new date from the date string to avoid timezone issues
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Create UTC date for the same calendar date
  const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  return startOfDay.toISOString();
}

/**
 * Get end of day (23:59:59.999) for a given date in UTC
 * @param date - The date to get end of day for
 * @returns ISO string representing end of day in UTC (e.g., "2026-04-29T23:59:59.999Z")
 */
export function getEndOfDay(date: Date): string {
  // Create a new date from the date string to avoid timezone issues
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Create UTC date for the same calendar date
  const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  return endOfDay.toISOString();
}

/**
 * Get date range for a single day (from 00:00:00 to 23:59:59)
 * @param date - The date to get range for
 * @returns Object with fromDate and toDate as ISO strings
 */
export function getDayRange(date: Date): { fromDate: string; toDate: string } {
  return {
    fromDate: getStartOfDay(date),
    toDate: getEndOfDay(date),
  };
}
