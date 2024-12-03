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

// Экшн для загрузки данных пользователя
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async () => {
    const response = await axiosInstance.get('/api/users/profile/'); // Пример запроса на сервер
    return response.data; // Возвращаем данные пользователя
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
        state.username = action.payload.username; // Записываем имя пользователя
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка при загрузке профиля';
      });
  },
});

export default userSlice.reducer;
