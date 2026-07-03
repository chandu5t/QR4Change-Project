import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSclice';
import complaintSlice from './slices/complaintSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    complaints: complaintSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;