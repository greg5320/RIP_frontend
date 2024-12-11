import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './searchSlice';
import filterReducer from './filterSlice';
import authReducer from './authSlice'; 
import userReducer from './userSlice'; 
import searchMapReducer from './searchMapsSlice'

const store = configureStore({
  reducer: {
    search: searchReducer, 
    auth: authReducer, 
    user: userReducer, 
    filters: filterReducer,
    searchMap: searchMapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
