import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../modules/axios';

export interface GameMap {
    id: number;
    title: string;
    description: string;
    status: string;
    image_url: string;
    players: string;
    tileset: string;
    overview: string;
}

interface MapState {
    map: GameMap | null;
    maps: GameMap[];
    loading: boolean;
    error: string | null;
    draftPoolCount: number;
    draftPoolId: number | null;
}

const initialState: MapState = {
    map: null,
    maps: [],
    loading: false,
    error: null,
    draftPoolCount: 0,
    draftPoolId: null,
};

export interface GameMapAdd {
    title: string;
    description: string;
    status: string;
    image_url: string;
    players: string;
    tileset: string;
    overview: string;
}

export const fetchMaps = createAsyncThunk<GameMap[], string | undefined>(
    'maps/fetchMaps',
    async (title = '', { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/maps/', {
                params: { title },
                withCredentials: true,
            });
            return response.data.maps as GameMap[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Ошибка при загрузке карт');
        }
    }
);

export const fetchDraftPoolInfo = createAsyncThunk(
    'maps/fetchDraftPoolInfo',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/maps/');
            return response.data.draft_pool_count || 0;
        } catch (error: any) {
            return rejectWithValue('Ошибка при загрузке информации о пуле карт');
        }
    }
);

export const fetchDraftPoolInfoId = createAsyncThunk(
    'maps/fetchDraftPoolInfoId',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/maps/');
            const draftPoolId = response.data.draft_pool_id;
            if (!draftPoolId) {
                return rejectWithValue('ID черновой заявки не найдено');
            }
            return draftPoolId;
        } catch (error: any) {
            return rejectWithValue('Ошибка при загрузке информации о пуле карт');
        }
    }
);

export const addToDraftPool = createAsyncThunk(
    'maps/addToDraftPool',
    async (mapId: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/api/maps/draft/', { map_id: mapId });
            return response.data;
        } catch (error: any) {
            return rejectWithValue('Ошибка при добавлении карты в пул заявок');
        }
    }
);

export const addNewMap = createAsyncThunk(
    'maps/addNewMap',
    async (newMap: GameMapAdd, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/api/maps/', newMap, { withCredentials: true });
            return response.data;
        } catch (error: any) {
            return rejectWithValue('Ошибка при добавлении новой карты');
        }
    }
);

export const removeMap = createAsyncThunk(
    'maps/removeMap',
    async (mapId: number, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/maps/${mapId}/`, { withCredentials: true });
            return;
        } catch (error: any) {
            return rejectWithValue('Ошибка при удалении карты из пула заявок');
        }
    }
);

export const fetchMapById = createAsyncThunk<GameMap, number>(
    'maps/fetchMapById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/maps/${id}`);
            return response.data as GameMap;
        } catch (error: any) {
            return rejectWithValue('Ошибка при загрузке карты');
        }
    }
);

export const fetchMapPoolById = createAsyncThunk(
    'maps/fetchMapPoolById',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/map_pools/${id}/`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue('Ошибка при загрузке пула карт');
        }
    }
);

export const savePlayerLogin = createAsyncThunk(
    'maps/savePlayerLogin',
    async (data: { mapPoolId: number; playerLogin: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/map_pools/${data.mapPoolId}/`, {
                player_login: data.playerLogin,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue('Ошибка при сохранении логина игрока');
        }
    }
);

export const submitMapPool = createAsyncThunk(
    'maps/submitMapPool',
    async (mapPoolId: number, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/map_pools/${mapPoolId}/submit/`, {}, { withCredentials: true });
            return response.data;
        } catch (error: any) {
            return rejectWithValue('Ошибка при подтверждении заявки');
        }
    }
);

export const deleteMapPool = createAsyncThunk(
    'maps/deleteMapPool',
    async (id: number, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/map_pools/${id}/`);
            return id;
        } catch (error: any) {
            return rejectWithValue('Ошибка при удалении пула карт');
        }
    }
);

export const deleteMapFromDraft = createAsyncThunk(
    'maps/deleteMapFromDraft',
    async ({ mapPoolId, mapId }: { mapPoolId: number, mapId: number }, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/map_pools/${mapPoolId}/map/${mapId}/`);
            return mapId;
        } catch (error: any) {
            return rejectWithValue('Ошибка при удалении карты из пула');
        }
    }
);

const mapSlice = createSlice({
    name: 'maps',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMaps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMaps.fulfilled, (state, action) => {
                state.loading = false;
                state.maps = action.payload;
            })
            .addCase(fetchMaps.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchDraftPoolInfo.fulfilled, (state, action) => {
                state.draftPoolCount = action.payload;
            })
            .addCase(fetchDraftPoolInfo.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(fetchDraftPoolInfoId.fulfilled, (state, action) => {
                state.draftPoolId = action.payload;
            })
            .addCase(addToDraftPool.fulfilled, (state) => {
                state.error = null;
            })
            .addCase(addToDraftPool.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(removeMap.fulfilled, (state, action) => {
                state.maps = state.maps.filter(map => map.id !== action.payload);
                state.error = null;
            })
            .addCase(addNewMap.fulfilled, (state, action) => {
                state.maps.push(action.payload);
                state.error = null;
            })
            .addCase(addNewMap.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(removeMap.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(fetchMapById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMapById.fulfilled, (state, action) => {
                state.loading = false;
                state.map = action.payload;
            })
            .addCase(fetchMapById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchMapPoolById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMapPoolById.fulfilled, (state, action) => {
                state.loading = false;
                state.maps = action.payload;
            })
            .addCase(fetchMapPoolById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(savePlayerLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(savePlayerLogin.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(savePlayerLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(submitMapPool.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitMapPool.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(submitMapPool.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteMapPool.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteMapPool.fulfilled, (state, action) => {
                state.loading = false;
                state.maps = state.maps.filter(map => map.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteMapPool.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteMapFromDraft.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteMapFromDraft.fulfilled, (state, action) => {
                state.loading = false;
                state.maps = state.maps.filter(map => map.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteMapFromDraft.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default mapSlice.reducer;
