/**
 * Date utility functions
 */

/**
 * Safely parse an API date string as local time by removing the 'Z' suffix
 * if it represents local time disguised as UTC.
 */
export function parseLocalDate(dateString: string | Date | null | undefined): Date | null {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  try {
    const clean = dateString.replace(/Z$/i, "");
    const parsed = new Date(clean);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch (error) {
    return null;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = parseLocalDate(dateString);
    if (!date) return "N/A";
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    return "N/A";
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = parseLocalDate(dateString);
    if (!date) return "N/A";
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "N/A";
  }
}

export function formatTime(timeString: string): string {
  try {
    // Handle both "HH:mm:ss" and "HH:mm" formats
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  } catch (error) {
    return timeString;
  }
}

export function formatTimeAgo(dateString: string | Date): string {
  if (!dateString) return "N/A";

  try {
    const date = parseLocalDate(dateString);
    if (!date) return "N/A";
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "vừa xong";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} phút trước`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return "N/A";
  }
}

