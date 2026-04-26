export const severityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Thấp", className: "bg-gray-100 text-gray-800" },
  medium: { label: "Trung bình", className: "bg-yellow-100 text-yellow-800" },
  high: { label: "Cao", className: "bg-orange-100 text-orange-800" },
  critical: {
    label: "Khẩn cấp",
    className: "bg-red-100 text-red-800 font-bold",
  },
};

export const issueStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  open: { label: "Mở", className: "bg-yellow-100 text-yellow-800" },
  in_progress: { label: "Đang xử lý", className: "bg-blue-100 text-blue-800" },
  resolved: {
    label: "Đã giải quyết",
    className: "bg-green-100 text-green-800",
  },
  closed: { label: "Đóng", className: "bg-gray-100 text-gray-800" },
};

export const requestStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  Pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800" },
  Approved: { label: "Đã duyệt", className: "bg-green-100 text-green-800" },
  Rejected: { label: "Từ chối", className: "bg-red-100 text-red-800" },
  pending: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Đã duyệt", className: "bg-green-100 text-green-800" },
  rejected: { label: "Từ chối", className: "bg-red-100 text-red-800" },
};
