import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  status: string;
  startDate: string | null;
  endDate: string | null;
  creator: string | null; 
}

const initialState: FilterState = {
  status: '',
  startDate: null,
  endDate: null,
  creator: null,  
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<FilterState>) => {
      state.status = action.payload.status;
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.creator = action.payload.creator;  
    },
    resetFilters: (state) => {
      state.status = '';
      state.startDate = null;
      state.endDate = null;
      state.creator = null;  
    },
  },
});

export const { setFilters, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
