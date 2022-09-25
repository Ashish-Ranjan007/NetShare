import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/*
	feeds endpoint in backend should return an array, it is currently returning an object. So this code must be changed later to accommodate an array of feeds.
*/
export type Feeds = {
	message: string;
	// Add more feed types here
};

export type FeedsState = {
	feeds: Feeds;
	// feeds: Feeds[];
};

const initialState: FeedsState = {
	feeds: {
		message: '',
	},
	// feeds: [{
	// 	// feed values goes here
	// }]
};

export const feedsSlice = createSlice({
	name: 'feeds',
	initialState,
	reducers: {
		setFeeds: ({ feeds }, action: PayloadAction<Feeds>) => {
			const { message } = action.payload;

			feeds.message = message;
		},
	},
});

// Export action creators
export const { setFeeds } = feedsSlice.actions;

// Export reducers
export default feedsSlice.reducer;
