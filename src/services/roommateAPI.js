// services/roommateAPI.js
import axiosInstance from './axiosInstance';

export const createRoommatePost = async (data) => {
  try {
    console.log('[roommateAPI] createRoommatePost payload:', data);
    // If caller provided a FormData (contains files), axios will set the correct
    // multipart/form-data headers automatically. Otherwise send JSON body.
    const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
    const res = await axiosInstance.post('/roommates', data);
    console.log('[roommateAPI] createRoommatePost response:', res.data);
    // Prefer to return the created post object when the server returns { message, post }
    return res.data.post ? res.data.post : res.data;
  } catch (err) {
    console.error('[roommateAPI] createRoommatePost error:', err?.response || err.message || err);
    // Normalize error to include server response if present
    const errorToThrow = err.response?.data || { message: err.message || 'Unknown error' };
    throw errorToThrow;
  }
};

// fetch posts for a specific boardingHouseId OR fetch all posts when no id provided
export const getRoommatePosts = async (boardingHouseId) => {
  const url = boardingHouseId ? `/roommates/${boardingHouseId}` : `/roommates`;
  const res = await axiosInstance.get(url);
  // server returns { posts } — normalize to array
  return res.data.posts || [];
};
export const deleteRoommatePost = async (postId) => {
  const res = await axiosInstance.delete(`/roommates/post/${postId}`);
  return res.data;
};
