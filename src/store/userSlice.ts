import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../modules/axios';

interface UserState {
  username: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  username: null,
  status: 'idle',
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_, { getState }) => {
    const state = getState() as any;
    const isAuthenticated = state.auth.isAuthenticated;
    if (!isAuthenticated) {
      return Promise.reject('User not authenticated');
    }
    const response = await axiosInstance.put('/api/users/profile/', {}, { withCredentials: true });
    return response.data; 
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.username = action.payload.username; 
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка при загрузке профиля';
      });
  },
});

export default userSlice.reducer;
