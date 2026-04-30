import React from "react";
import { WarningOutlined } from "@ant-design/icons";

/* ─── helpers ────────────────────────────────────────────── */
export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

export const getFinalPrice = (pricing) => {
  if (!pricing) return 0;
  return pricing.totalAfterPromotion ?? (Math.max(0, (pricing.totalPrice || 0) - (pricing.discountAmount || 0)));
};

/* ─── status maps ─────────────────────────────────────────── */
export const TICKET_STATUS = {
  CREATED: { label: "Chờ xác nhận lịch", cls: "mo-tag--blue" },
  WAITING_SURVEY: { label: "Đã phân công nhân viên khảo sát", cls: "mo-tag--orange" },
  WAITING_REVIEW: { label: "Đang chờ đánh giá", cls: "mo-tag--orange" },
  SURVEYED: { label: "Đã khảo sát", cls: "mo-tag--cyan" },
  QUOTED: { label: "Đã báo giá", cls: "mo-tag--orange" },
  ACCEPTED: { label: "Đã chấp nhận báo giá", cls: "mo-tag--geekblue" },
  CONVERTED: { label: "Đã tạo HĐ", cls: "mo-tag--purple" },
  IN_PROGRESS: { label: "Đang vận chuyển", cls: "mo-tag--processing" },
  COMPLETED: { label: "Hoàn thành", cls: "mo-tag--green" },
  CANCELLED: { label: "Đã hủy", cls: "mo-tag--red" },
};

export const INVOICE_STATUS = {
  DRAFT: { label: "Nháp hóa đơn", cls: "mo-tag--purple" },
  CONFIRMED: { label: "Đã xác nhận", cls: "mo-tag--blue" },
  ASSIGNED: { label: "Đã phân công xe", cls: "mo-tag--cyan" },
  IN_PROGRESS: { label: "Đang vận chuyển", cls: "mo-tag--processing" },
  COMPLETED: { label: "Hoàn thành", cls: "mo-tag--green" },
  CANCELLED: { label: "Đã hủy", cls: "mo-tag--red" },
};

export const PAYMENT_STATUS = {
  UNPAID: { label: "Chưa thanh toán", cls: "mo-tag--orange" },
  PARTIAL: { label: "Đã đặt cọc", cls: "mo-tag--cyan" },
  PAID: { label: "Đã thanh toán", cls: "mo-tag--green" },
};

export const INCIDENT_STATUS = {
  Open: { label: "Đã báo cáo", cls: "mo-tag--orange" },
  Investigating: { label: "Đang xử lý", cls: "mo-tag--processing" },
  Resolved: { label: "Đã giải quyết", cls: "mo-tag--green" },
  Dismissed: { label: "Từ chối xử lý", cls: "mo-tag--red" },
};

export const MOVE_TYPE = {
  FULL_HOUSE: { label: "Chuyển Nhà Trọn Gói", cls: "mo-tag--geekblue" },
  SPECIFIC_ITEMS: { label: "Chuyển Đồ Đạc", cls: "mo-tag--cyan" },
  TRUCK_RENTAL: { label: "Thuê Xe Tải", cls: "mo-tag--purple" },
  OFFICE_MOVING: { label: "Chuyển Văn Phòng", cls: "mo-tag--orange" },
};

export const translateTruckType = (type) => {
  if (!type) return "Không xác định";
  const map = {
    "500KG": "Xe tải 500kg",
    "1.5T": "Xe tải 1.5 Tấn",
    "2T": "Xe tải 2 Tấn",
    "2.5T": "Xe tải 2.5 Tấn",
  };
  return map[type] || type;
};

/* ─── filter tabs config ──────────────────────────────────── */
export const FILTERS = [
  { key: "ALL", label: "Tất cả" },
  { key: "QUOTED", label: "Chờ chấp nhận báo giá" },
  { key: "PROCESSING", label: "Đang xử lý" },
  { key: "IN_PROGRESS", label: "Đang vận chuyển" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
];

/* ─── Common Components ───────────────────────────────────── */
export const StatusTag = ({ cls, children, onClick, icon }) => (
  <span className={`mo-tag ${cls || "mo-tag--gray"}`} onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
    {icon && <span className="mo-tag-icon">{icon}</span>}
    {children}
  </span>
);

export const IncidentTag = ({ incident, status, onClick }) => {
  const isActive = ["Open", "Investigating"].includes(incident?.status);
  if (isActive) {
    return (
      <span className="mo-tag--incident-open" onClick={onClick}>
        <span className="mo-tag--incident-dot" />
        <WarningOutlined style={{ marginRight: 4 }} /> {status.label}
      </span>
    );
  }
  return (
    <StatusTag cls={status.cls} onClick={onClick} icon={<WarningOutlined />}>
      {status.label}
    </StatusTag>
  );
};

export const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
    <span style={{ color: '#52c41a', fontSize: 13, flexShrink: 0 }}>{icon}</span>
    <span style={{ color: '#555', flexShrink: 0 }}>{label}:</span>
    <span style={{ fontWeight: 500, color: '#222' }}>{value}</span>
  </div>
);
