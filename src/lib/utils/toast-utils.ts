import { toast } from "sonner";

// Toast utility functions với styling và UX tốt hơn
export const toastUtils = {
  // Success toast - màu xanh lá
  success: (message: string, description?: string) => {
    return toast.success(message, {
      description,
      duration: 3000,
    });
  },

  // Error toast - màu đỏ
  error: (message: string, description?: string) => {
    return toast.error(message, {
      description,
      duration: 5000, // Lỗi hiển thị lâu hơn
    });
  },

  // Warning toast - màu vàng
  warning: (message: string, description?: string) => {
    return toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  // Info toast - màu xanh dương
  info: (message: string, description?: string) => {
    return toast.info(message, {
      description,
      duration: 3000,
    });
  },

  // Loading toast - màu xám
  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
    });
  },

  // Promise toast - tự động chuyển đổi trạng thái
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  // Custom toast với action button
  custom: (
    message: string,
    {
      description,
      action,
      cancel,
      duration = 4000,
    }: {
      description?: string;
      action?: {
        label: string;
        onClick: () => void;
      };
      cancel?: {
        label: string;
        onClick?: () => void;
      };
      duration?: number;
    } = {},
  ) => {
    return toast(message, {
      description,
      duration,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick,
          }
        : undefined,
      cancel: cancel?.onClick
        ? {
            label: cancel.label,
            onClick: cancel.onClick,
          }
        : undefined,
    });
  },

  // Dismiss all toasts
  dismiss: (toastId?: string | number) => {
    return toast.dismiss(toastId);
  },
};

// Specific toast messages cho notification features
export const notificationToasts = {
  markAsReadSuccess: () =>
    toastUtils.success("Đã đánh dấu đã đọc", "Thông báo đã được cập nhật"),

  markAsReadError: () =>
    toastUtils.error("Không thể đánh dấu đã đọc", "Vui lòng thử lại sau"),

  markAllAsReadSuccess: () =>
    toastUtils.success(
      "Đã đánh dấu tất cả đã đọc",
      "Tất cả thông báo đã được cập nhật",
    ),

  markAllAsReadError: () =>
    toastUtils.error(
      "Không thể đánh dấu tất cả đã đọc",
      "Vui lòng thử lại sau",
    ),

  loadNotificationsError: () =>
    toastUtils.error(
      "Không thể tải thông báo",
      "Kiểm tra kết nối mạng và thử lại",
    ),

  loadNotificationDetailError: () =>
    toastUtils.error(
      "Không thể tải chi tiết thông báo",
      "Thông báo có thể đã bị xóa hoặc không tồn tại",
    ),

  openNotificationError: () =>
    toastUtils.error("Không thể mở thông báo", "Vui lòng thử lại sau"),
};

// API operation toasts
export const apiToasts = {
  createSuccess: (itemName: string) =>
    toastUtils.success(`Tạo ${itemName} thành công`, "Dữ liệu đã được lưu"),

  updateSuccess: (itemName: string) =>
    toastUtils.success(
      `Cập nhật ${itemName} thành công`,
      "Thay đổi đã được lưu",
    ),

  deleteSuccess: (itemName: string) =>
    toastUtils.success(`Xóa ${itemName} thành công`, "Dữ liệu đã được xóa"),

  createError: (itemName: string) =>
    toastUtils.error(
      `Không thể tạo ${itemName}`,
      "Vui lòng kiểm tra lại thông tin",
    ),

  updateError: (itemName: string) =>
    toastUtils.error(`Không thể cập nhật ${itemName}`, "Vui lòng thử lại sau"),

  deleteError: (itemName: string) =>
    toastUtils.error(`Không thể xóa ${itemName}`, "Vui lòng thử lại sau"),

  loadError: (itemName: string) =>
    toastUtils.error(`Không thể tải ${itemName}`, "Kiểm tra kết nối mạng"),

  networkError: () =>
    toastUtils.error(
      "Lỗi kết nối mạng",
      "Vui lòng kiểm tra kết nối internet và thử lại",
    ),

  unauthorizedError: () =>
    toastUtils.error("Phiên đăng nhập đã hết hạn", "Vui lòng đăng nhập lại"),

  forbiddenError: () =>
    toastUtils.error(
      "Không có quyền truy cập",
      "Bạn không có quyền thực hiện thao tác này",
    ),

  validationError: (message?: string) =>
    toastUtils.error(
      "Dữ liệu không hợp lệ",
      message || "Vui lòng kiểm tra lại thông tin nhập vào",
    ),
};
