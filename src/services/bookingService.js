import axiosInstance from './axiosInstance'; // Assuming you have this configured instance

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get user's booking for specific BOARDING HOUSE (check if they booked ANY room there)
export const getUserBookingForBoardingHouse = async (userId, boardingHouseId) => {
    try {
        // Assuming the backend route remains the same but checks across all rooms
        const response = await axiosInstance.get(
            `/bookings/user/${userId}/boarding-house/${boardingHouseId}`
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null; // No booking found
        }
        console.error('Error fetching user booking for boarding-house:', error.response?.data || error.message);
        throw error;
    }
};

// Get user's booking history
export const getUserBookingHistory = async () => { // Removed userId, assuming it's inferred from token
    try {
        const response = await axiosInstance.get(`/bookings/user/history`); // Adjusted endpoint
        return response.data;
    } catch (error) {
        console.error('Error fetching booking history:', error.response?.data || error.message);
        throw error;
    }
};

export const getUserRequestHistory = async () => { // Removed userId, assuming it's inferred from token
    try {
        const response = await axiosInstance.get(`/bookings/user/request-history`); // Adjusted endpoint
        return response.data;
    } catch (error) {
        console.error('Error fetching booking history:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Tenant requests to book a specific room.
 * @param {object} data - { boardingHouseId, roomId }
 */
export const requestBooking = async (data) => {
    try {
        const response = await axiosInstance.post('/bookings/request', data);
        return response.data;
    } catch (error) {
        console.error('Error requesting booking:', error.response?.data || error.message);
        throw error; // Re-throw to be handled by the component
    }
};

/**
 * Owner gets a list of pending booking requests for their properties.
 */
export const getOwnerPendingBookings = async () => {
    try {
        const response = await axiosInstance.get('/owner/bookings/pending');
        return response.data;
    } catch (error) {
        console.error('Error fetching pending bookings:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Owner approves or rejects a booking request.
 * @param {string} bookingId - The ID of the booking to update.
 * @param {object} data - { status: 'approved' | 'rejected', reason?: string }
 */
export const updateBookingApproval = async (bookingId, data) => {
    try {
        const response = await axiosInstance.put(`/owner/bookings/${bookingId}/approval`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating booking approval:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get details of a specific booking by its ID.
 * @param {string} bookingId - The ID of the booking.
 */
export const getBookingById = async (bookingId) => {
    try {
        const response = await axiosInstance.get(`/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching booking details:', error.response?.data || error.message);
        throw error;
    }
};


export const cancelBookingRequest = async (bookingId) => {
    try {
        const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`);
        return response.data;
    } catch (error) {
        console.error('Error cancelling booking request:', error.response?.data || error.message);
        throw error;
    }
};

// --- Updated Export ---
// Export all functions for use in components
export default {
    getUserBookingForBoardingHouse,
    getUserBookingHistory,
    getUserRequestHistory,
    requestBooking,
    getOwnerPendingBookings,
    updateBookingApproval,
    getBookingById,
    cancelBookingRequest,
};