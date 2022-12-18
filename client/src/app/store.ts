import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from '../features/api/apiSlice';
import authReducer from '../features/auth/authSlice';
import postReducer from '../features/post/postSlice';
import feedsReducer from '../features/feeds/feedsSlice';
import widgetsSlice from '../features/widgets/widgetsSlice';
import notificationSlice from '../features/notifications/notificationSlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		post: postReducer,
		feeds: feedsReducer,
		widgets: widgetsSlice,
		notifications: notificationSlice,
		[apiSlice.reducerPath]: apiSlice.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
	devTools: true,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
