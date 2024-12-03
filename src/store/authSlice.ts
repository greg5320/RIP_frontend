import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import axiosInstance from '../modules/axios';

interface AuthState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  user: any | null;
}

const initialState: AuthState = {
  status: 'idle',
  error: null,
  user: null,
};

// Асинхронный экшен для регистрации пользователя
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: { username: string; password: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/users/register/', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка регистрации');
    }
  }
);

// Асинхронный экшен для авторизации пользователя
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/users/login/', userData);
      return response.data; // Возвращаем данные пользователя
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка авторизации');
    }
  }
);

// Асинхронный экшен для выхода из системы
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/api/users/logout/');
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка при выходе из системы');
    }
  }
);

// Асинхронный экшен для получения текущего пользователя
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/users/profile/');
      return response.data; // Возвращаем данные текущего пользователя
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка при получении данных пользователя');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Экшен для сброса статуса авторизации
    resetAuthStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { resetAuthStatus } = authSlice.actions;

// Селекторы
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUser = (state: RootState) => state.auth.user;

export default authSlice.reducer;
