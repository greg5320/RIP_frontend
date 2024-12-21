import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../modules/axios';
import { RootState } from '../store';

interface MapPool {
  id: number;
  status: string;
  creation_date: string;
  submit_date: string | null;
  complete_date: string | null;
  player_login: string;
}

interface MapPoolState {
  mapPools: MapPool[];
  loading: boolean;
  error: string | null;
}

const initialState: MapPoolState = {
  mapPools: [],
  loading: false,
  error: null,
};

export const fetchMapPools = createAsyncThunk<
  MapPool[],
  { status_query?: string; start_date?: string; end_date?: string; creator_query?: string },
  { rejectValue: string }
>('mapPools/fetchMapPools', async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (filters.status_query) params.append('status_query', filters.status_query);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.creator_query) params.append('creator_query', filters.creator_query);

    const response = await axiosInstance.get(`/api/map_pools/?${params.toString()}`);
    return response.data.sort((a: MapPool, b: MapPool) => {
      if (a.status === 'draft' && b.status !== 'draft') return -1;
      if (a.status !== 'draft' && b.status === 'draft') return 1;
      if (a.status === 'submitted' && b.status !== 'submitted') return -1;
      if (a.status !== 'submitted' && b.status === 'submitted') return 1;
      return new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime();
    });
  } catch (error: any) {
    return rejectWithValue('Не удалось загрузить пулы карт.');
  }
});

export const completeMapPool = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>('mapPools/completeMapPool', async (id, { dispatch, rejectWithValue }) => {
  try {
    await axiosInstance.put(`/api/map_pools/${id}/complete/`, { action: 'complete' });
    dispatch(fetchMapPools({})); 
  } catch (error: any) {
    return rejectWithValue('Ошибка при завершении заявки.');
  }
});

export const rejectMapPool = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>('mapPools/rejectMapPool', async (id, { dispatch, rejectWithValue }) => {
  try {
    await axiosInstance.put(`/api/map_pools/${id}/complete/`, { action: 'reject' });
    dispatch(fetchMapPools({})); 
  } catch (error: any) {
    return rejectWithValue('Ошибка при отклонении заявки.');
  }
});

const mapPoolSlice = createSlice({
  name: 'mapPools',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMapPools.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMapPools.fulfilled, (state, action: PayloadAction<MapPool[]>) => {
        state.mapPools = action.payload;
        state.loading = false;
      })
      .addCase(fetchMapPools.rejected, (state, action) => {
        state.error = action.payload || 'Ошибка загрузки данных';
        state.loading = false;
      })
      .addCase(completeMapPool.rejected, (state, action) => {
        state.error = action.payload || 'Ошибка завершения пула карт';
      })
      .addCase(rejectMapPool.rejected, (state, action) => {
        state.error = action.payload || 'Ошибка отклонения пула карт';
      });
  },
});

export const selectMapPools = (state: RootState) => state.mapPools.mapPools;
export const selectLoading = (state: RootState) => state.mapPools.loading;
export const selectError = (state: RootState) => state.mapPools.error;

export default mapPoolSlice.reducer;
