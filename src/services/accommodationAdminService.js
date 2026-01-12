import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Lấy danh sách nhà trọ cho admin xem xét.
 * @param {object} params - Các tham số filter (ví dụ: status, page, limit).
 */
export const getAdminBoardingHouses = async (params = {}) => {
  const token = localStorage.getItem("token");
  // Endpoint đã được cập nhật
  const response = await axios.get(`${API_BASE_URL}/admin/boarding-houses`, {
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Lấy chi tiết một nhà trọ (bao gồm các phòng) cho admin.
 * @param {string} id - ID của nhà trọ.
 */
export const getBoardingHouseDetailAdmin = async (id) => {
  const token = localStorage.getItem("token");
  // Endpoint đã được cập nhật
  const response = await axios.get(`${API_BASE_URL}/admin/boarding-houses/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * Duyệt (chấp thuận/từ chối) một bài đăng nhà trọ.
 * @param {string} id - ID của nhà trọ.
 * @param {string} approvedStatus - Trạng thái mới ('approved' hoặc 'rejected').
 * @param {string} rejectedReason - Lý do từ chối (nếu có).
 */
export const approveBoardingHouseAdmin = async (id, approvedStatus, rejectedReason = '') => {
  const token = localStorage.getItem("token");
  // Endpoint đã được cập nhật
  const response = await axios.put(`${API_BASE_URL}/admin/boarding-houses/${id}/approve`, {
    approvedStatus,
    rejectedReason
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

/**
 * "Xóa mềm" một nhà trọ (chuyển trạng thái sang 'deleted').
 * @param {string} id - ID của nhà trọ.
 * @param {string} reason - Lý do xóa.
 */
export const deleteBoardingHouseAdmin = async (id, reason) => {
  const token = localStorage.getItem("token");
  // Endpoint đã được cập nhật
  const response = await axios.put(`${API_BASE_URL}/admin/boarding-houses/${id}/delete`, {
    reason
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

const boardingHouseAdminService = {
  getAdminBoardingHouses,
  getBoardingHouseDetailAdmin,
  approveBoardingHouseAdmin,
  deleteBoardingHouseAdmin
};

export default boardingHouseAdminService;