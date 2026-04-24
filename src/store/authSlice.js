import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { clearAccessToken, logoutApi } from '../services/authService';
import { resetCsrfToken } from '../services/api';

// 1. TẠO THUNK: Xử lý phần gọi API bất đồng bộ
export const logoutUserThunk = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    console.log("👋 [Redux Thunk] Logging out - calling server");
    try {
      await logoutApi();
    } catch (error) {
      console.warn("Logout API failed:", error);
    }

    dispatch(logoutStore());
    
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logoutStore: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      clearAccessToken();
      resetCsrfToken();
      localStorage.removeItem("hasSession");
    },
  },
});

export const { setCredentials, setLoading, logoutStore } = authSlice.actions;
export default authSlice.reducer;