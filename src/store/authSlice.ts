import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import axiosInstance from '../modules/axios';

interface AuthState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  user: any | null;
  isAuthenticated: boolean;
  is_staff: boolean;
}

const initialState: AuthState = {
  status: 'idle',
  error: null,
  user: null,
  isAuthenticated: false,
  is_staff: false
};

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

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/users/login/', userData);
      return response.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка авторизации');
    }
  }
);

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

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const cookies = document.cookie;
      if (!cookies.includes('session_id=')) {
        throw new Error('Нет Session ID');
      }
      const response = await axiosInstance.put('/api/users/profile/', {}, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || '');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    resetAuthStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    login: (state) => {
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
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
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.isAuthenticated = false;
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
        state.is_staff = action.payload.is_staff;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});


export const { resetAuthStatus, setAuthenticated, login, logout } = authSlice.actions;


export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUser = (state: RootState) => state.auth.user;

export default authSlice.reducer;
