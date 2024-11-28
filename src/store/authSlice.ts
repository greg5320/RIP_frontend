import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../modules/axios';

interface User {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }) => {
    const response = await axiosInstance.post('/api/users/login/', credentials);
    return response.data; 
  }
);
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: { username: string; password: string; email: string }) => {
    const response = await axiosInstance.post('/api/users/register/', credentials);
    return response.data; 
  }
);


export const fetchCurrentUser = createAsyncThunk('auth/me', async () => {
  const response = await axiosInstance.get('/api/users/profile/'); 
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload; 
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка входа';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка регистрации';
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
        state.error = action.error.message || 'Ошибка получения данных пользователя';
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
