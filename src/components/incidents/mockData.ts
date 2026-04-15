import { IssueReport, EmergencyAlert, AdHocRequest } from "./types";

export const mockIssues: IssueReport[] = [
  {
    id: "IS-001",
    title: "Rò rỉ hóa chất tại kho B",
    description:
      "Phát hiện hóa chất rò rỉ tại kho vật tư B, cần xử lý khẩn cấp",
    worker: "Hoàng Văn E",
    location: "BV Q1 - Kho B",
    severity: "critical",
    status: "open",
    createdAt: "10:15 hôm nay",
    hasPhoto: true,
  },
  {
    id: "IS-002",
    title: "Máy hút bụi hỏng",
    description: "Máy hút bụi công nghiệp tại tầng 2 không hoạt động",
    worker: "Trần Thị B",
    location: "VP ABC - T2",
    severity: "medium",
    status: "in_progress",
    createdAt: "09:00 hôm nay",
    hasPhoto: true,
  },
  {
    id: "IS-003",
    title: "Sàn trơn trượt sau mưa",
    description: "Sảnh chính bị ngấm nước mưa, sàn rất trơn",
    worker: "Ngô Thị F",
    location: "VP XYZ - T1",
    severity: "high",
    status: "open",
    createdAt: "08:30 hôm nay",
    hasPhoto: false,
  },
  {
    id: "IS-004",
    title: "Thiếu chất khử trùng",
    description: "Hết dung dịch khử trùng cho phòng mổ tầng 3",
    worker: "Nguyễn Văn A",
    location: "BV Q1 - T3",
    severity: "high",
    status: "resolved",
    createdAt: "Hôm qua",
    hasPhoto: false,
  },
];

export const mockEmergencies: EmergencyAlert[] = [
  {
    id: "EM-001",
    worker: "Hoàng Văn E",
    location: "BV Q1 - Kho B",
    time: "10:12 hôm nay",
    status: "active",
    note: "Rò rỉ hóa chất, cần hỗ trợ ngay",
  },
  {
    id: "EM-002",
    worker: "Lê Văn C",
    location: "VP ABC - T3",
    time: "Hôm qua 14:30",
    status: "resolved",
    note: "Ngã tại cầu thang, đã được hỗ trợ y tế",
  },
];

export const mockRequests: AdHocRequest[] = [
  {
    id: "RQ-001",
    type: "adhoc_task",
    requester: "Ngô Thị F (Worker)",
    description: "Cần thêm nhân sự vệ sinh sảnh do sự kiện đông khách",
    urgency: "urgent",
    status: "pending",
    createdAt: "09:30 hôm nay",
  },
  {
    id: "RQ-002",
    type: "equipment",
    requester: "Trần Thị B (Worker)",
    description: "Yêu cầu máy lau sàn công nghiệp cho tầng 2",
    urgency: "normal",
    status: "pending",
    createdAt: "08:45 hôm nay",
  },
  {
    id: "RQ-003",
    type: "adhoc_task",
    requester: "Supervisor Khu A",
    description: "Tạo task khẩn cấp dọn vệ sinh phòng họp VIP trước 14:00",
    urgency: "urgent",
    status: "approved",
    createdAt: "Hôm qua",
  },
  {
    id: "RQ-004",
    type: "equipment",
    requester: "Nguyễn Văn A (Worker)",
    description: "Yêu cầu bộ PPE mới (khẩu trang N95, găng tay y tế)",
    urgency: "normal",
    status: "rejected",
    createdAt: "2 ngày trước",
  },
];
