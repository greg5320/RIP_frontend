import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './searchSlice';
import filterReducer from './filterSlice';
import authReducer from './authSlice'; 
import userReducer from './userSlice'; 
import searchMapReducer from './searchMapsSlice'
import mapPoolReducer from './mapPoolSlice';
import mapReducer from './mapSlice';

const store = configureStore({
  reducer: {
    search: searchReducer, 
    auth: authReducer, 
    user: userReducer, 
    filters: filterReducer,
    searchMap: searchMapReducer,
    mapPools: mapPoolReducer,
    maps: mapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
