import axiosInstance from './axiosInstance';

// --- URL CONSTANTS ---
// URL đã thay đổi từ 'accommodation' sang 'boarding-houses'
const API_BOARDING_HOUSE_URL = 'http://localhost:5000/api/boarding-houses';
const API_ROOM_URL = 'http://localhost:5000/api/rooms';
const API_FAV_URL = 'http://localhost:5000/api/favorites';
const API_CONTRACT_URL = 'http://localhost:5000/api/contracts';

// ================================================================
// BOARDING HOUSE APIs (NHÀ TRỌ)
// ================================================================

/**
 * Tạo một nhà trọ mới cùng với các phòng ban đầu.
 * @param {object} data - Dữ liệu nhà trọ, ví dụ: { name, description, location, rooms: [...] }
 */
export const createBoardingHouse = async (data) => {
    // FormData được gửi đi từ component, không cần log ở đây
    const response = await axiosInstance.post(`${API_BOARDING_HOUSE_URL}/`, data);
    return response.data;
};

/**
 * Lấy tất cả nhà trọ (đã được duyệt) cho khách xem.
 */
export const getAllBoardingHouses = async () => {
    const response = await axiosInstance.get(`${API_BOARDING_HOUSE_URL}/`);
    return response.data;
};

/**
 * Lấy tất cả nhà trọ của một chủ sở hữu (bao gồm cả các trạng thái).
 * @param {string} ownerId - ID của chủ sở hữu.
 */
export const getOwnerBoardingHouses = async (ownerId) => {
    const response = await axiosInstance.get(`${API_BOARDING_HOUSE_URL}/`, {
        params: { ownerId }
    });
    return response.data;
};

/**
 * Tìm kiếm nhà trọ theo các tiêu chí.
 * @param {object} filters - Ví dụ: { district, street, minPrice, maxPrice }
 */
export const searchBoardingHouses = async (filters) => {
    // URL đã thay đổi
    const response = await axiosInstance.get(`${API_BOARDING_HOUSE_URL}/searchBoardingHouse`, {
        params: filters,
    });
    return response.data;
};

/**
 * Lấy thông tin chi tiết một nhà trọ bằng ID.
 * @param {string} id - ID của nhà trọ.
 */

export const getBoardingHouseById = async (id) => {
    const response = await axiosInstance.get(`${API_BOARDING_HOUSE_URL}/${id}`);
    return response.data;
};

/**
 * Cập nhật thông tin cơ bản của nhà trọ.
 * @param {string} id - ID của nhà trọ.
 * @param {object} updatedData - Dữ liệu cập nhật.
 */
export const updateBoardingHouse = async (id, updatedData) => {
    const response = await axiosInstance.put(`${API_BOARDING_HOUSE_URL}/${id}`, updatedData);
    return response.data;
};

/**
 * Xóa một nhà trọ (và tất cả các phòng bên trong).
 * @param {string} id - ID của nhà trọ.
 */
export const deleteBoardingHouse = async (id) => {
    const response = await axiosInstance.delete(`${API_BOARDING_HOUSE_URL}/${id}`);
    return response.data;
};


// ================================================================
// ROOM APIs (PHÒNG TRỌ)
// ================================================================

/**
 * Thêm một hoặc nhiều phòng mới vào nhà trọ đã có.
 * @param {string} boardingHouseId - ID của nhà trọ.
 * @param {object} roomsData - Dữ liệu các phòng mới, ví dụ: { rooms: [{ roomNumber, price, area }] }
 */
export const addRoomsToBoardingHouse = async (boardingHouseId, roomsData) => {
    const response = await axiosInstance.post(`${API_ROOM_URL}/${boardingHouseId}/rooms`, roomsData);
    return response.data;
};

/**
 * Cập nhật thông tin một phòng trọ.
 * @param {string} roomId - ID của phòng.
 * @param {object} updatedData - Dữ liệu cập nhật cho phòng.
 */
export const updateRoom = async (roomId, updatedData) => {
    const response = await axiosInstance.put(`${API_ROOM_URL}/${roomId}`, updatedData);
    return response.data;
};

/**
 * Xóa một phòng trọ.
 * @param {string} roomId - ID của phòng.
 */
export const deleteRoom = async (roomId) => {
    const response = await axiosInstance.delete(`${API_ROOM_URL}/${roomId}`);
    return response.data;
};

// ================================================================
// CONTRACT APIs (HỢP ĐỒNG)
// ================================================================

export const getContractTemplateForHouse = async (boardingHouseId) => {
    const response = await axiosInstance.get(`${API_CONTRACT_URL}/boarding-houses/${boardingHouseId}/contract`);
    return response.data;
};

export const getOwnerContractTemplate = async () => {
    const response = await axiosInstance.get(`/owner/contract-template`);
    return response.data;
};

// Tạo hoặc cập nhật mẫu hợp đồng (dùng FormData vì có ảnh)
export const createOrUpdateContractTemplate = async (payload) => {
    const response = await axiosInstance.post(`/owner/contract-template`, payload);
    return response.data;
};

// ================================================================
// FAVORITE APIs (YÊU THÍCH)
// ================================================================

/**
 * Thêm một nhà trọ vào danh sách yêu thích.
 * @param {object} data - { boardingHouseId: '...' }
 */
export const addToFavorite = async (data) => {
    const response = await axiosInstance.post(`${API_FAV_URL}/`, data);
    return response.data;
};

export const getUserFavorites = async () => {
    const res = await axiosInstance.get("/favorites");
    return res.data.favorites;
};

/**
 * Xóa một nhà trọ khỏi danh sách yêu thích.
 * @param {string} boardingHouseId - ID của nhà trọ.
 */
export const removeFromFavorite = async (boardingHouseId) => {
    const res = await axiosInstance.delete(`/favorites/${boardingHouseId}`);
    return res.data;
};


// ================================================================
// OWNER STATISTICS & RATING APIs (THỐNG KÊ CỦA CHỦ TRỌ)
// ================================================================

// Các hàm này giữ nguyên, chỉ cần đảm bảo URL base đã được cập nhật
export const getOwnerRatings = async () => {
    const response = await axiosInstance.get(`${API_BOARDING_HOUSE_URL}/owner/ratings`);
    return response.data;
};

export const getBoardingHouseRatings = async (boardingHouseId) => { // Đổi tên tham số cho rõ ràng
    const response = await axiosInstance.get(`${API_BOARDING_HOUSE_URL}/owner/${boardingHouseId}/ratings`);
    return response.data;
};

export const getOwnerStatistics = async () => {
    // backend route: GET /api/owner/statistics
    const response = await axiosInstance.get(`/owner/statistics`);
    return response.data;
};

export const getOwnerRecentBookings = async (limit = 10) => {
    // backend route: GET /api/owner/bookings/recent?limit=10
    const response = await axiosInstance.get(`/boarding-houses/owner/recent-bookings?limit=${limit}`);
    return response.data;
};

export const getOwnerTopBoardingHouses = async (limit = 5) => {
    // backend route: GET /api/owner/boarding-houses/top?limit=5
    // your backend implemented getOwnerTopAccommodations at /api/boarding-houses/owner/top-accommodations
    // choose the route that your server actually exposes. Based on your code: getOwnerTopAccommodations => /api/boarding-houses/owner/top-accommodations
    const response = await axiosInstance.get(`/boarding-houses/owner/top-accommodations?limit=${limit}`);
    return response.data;
};

export const getOwnerMonthlyRevenue = async (months = 6) => {
    // backend route: GET /api/owner/revenue/monthly?months=6 OR GET /api/owner/monthly-revenue?months=6
    // Based on your code: exports.getOwnerMonthlyRevenue is annotated @route GET /api/owner/revenue/monthly
    const response = await axiosInstance.get(`/boarding-houses/owner/monthly-revenue?months=${months}`);
    return response.data;
};

export const getOwnerCurrentMembership = async () => {
    // backend route: GET /api/boarding-houses/owner/current-membership (seems present)
    const response = await axiosInstance.get(`/boarding-houses/owner/current-membership`);
    return response.data;
};

export const getOwnerBoardingHousesWithRatings = async () => {
    const response = await axiosInstance.get(`/owner/boarding-houses/ratings`);
    return response.data;
};

export const getOwnerMembershipInfo = async () => {
    const response = await axiosInstance.get(`${API_BOARDING_HOUSE_URL}/owner/membership-info`);
    return response.data;
};