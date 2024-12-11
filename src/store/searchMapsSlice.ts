import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchMapState {
  searchTerm: string;
}

const initialState: SearchMapState = {
  searchTerm: '',
};

const searchMapSlice = createSlice({
  name: 'searchMap',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
  },
});

export const { setSearchTerm } = searchMapSlice.actions;

export default searchMapSlice.reducer;
