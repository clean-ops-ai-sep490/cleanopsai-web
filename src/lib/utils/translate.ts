/**
 * Translation utilities for status and service types
 */

// Service Type translations
export const translateServiceType = (serviceType: string): string => {
  const translations: Record<string, string> = {
    Cleaning: "Vệ sinh",
    Maintenance: "Bảo trì",
    Repair: "Sửa chữa",
    Inspection: "Kiểm tra",
  };

  return translations[serviceType] || serviceType;
};

// Task Assignment Status translations
export const translateTaskStatus = (status: string): string => {
  const translations: Record<string, string> = {
    NotStarted: "Chưa bắt đầu",
    InProgress: "Đang thực hiện",
    Completed: "Hoàn thành",
    Cancelled: "Đã hủy",
  };

  return translations[status] || status;
};

// Active/Inactive Status translations
export const translateActiveStatus = (isActive: boolean): string => {
  return isActive ? "Hoạt động" : "Không hoạt động";
};

// SLA Status translations
export const translateSLAStatus = (status: string): string => {
  const translations: Record<string, string> = {
    Active: "Hoạt động",
    Inactive: "Không hoạt động",
    Draft: "Bản nháp",
    Archived: "Đã lưu trữ",
  };

  return translations[status] || status;
};

// Recurrence Type translations
export const translateRecurrenceType = (type: string): string => {
  const translations: Record<string, string> = {
    Daily: "Hàng ngày",
    Weekly: "Hàng tuần",
    Monthly: "Hàng tháng",
    Yearly: "Hàng năm",
    Once: "Một lần",
  };

  return translations[type] || type;
};
