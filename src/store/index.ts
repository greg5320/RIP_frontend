import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './searchSlice';
import authReducer from './authSlice'; 
import userReducer from './userSlice'; 

const store = configureStore({
  reducer: {
    search: searchReducer, 
    auth: authReducer, 
    user: userReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
