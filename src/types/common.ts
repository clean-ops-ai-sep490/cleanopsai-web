/**
 * Common types used across the application to avoid duplication
 */

// Re-export from api-response-parser for convenience
export type { PaginatedResponse } from "@/lib/api-response-parser";

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Common enums used across multiple domains
 */
export enum RequestStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
  Fulfilled = "Fulfilled",
}

export enum RiskLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Critical = "Critical",
}

export enum SkillLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
  Expert = "Expert",
}

/**
 * Extended pagination request with additional filters
 */
export interface PaginatedRequest extends PaginationParams {
  [key: string]: any;
}

/**
 * Generic form data interface
 */
export interface FormData {
  [key: string]: any;
}

/**
 * API response wrapper for single items
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  title: string;
  status: number;
  detail: string;
  instance: string;
  traceId: string;
  errors?: Record<string, string[]>;
}

/**
 * Common entity base interface
 */
export interface BaseEntity {
  id: string;
  createdAt?: string;
  lastModified?: string;
}

/**
 * Form validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Generic select option
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
