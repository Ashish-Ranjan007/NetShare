import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { ProfileReference } from '../../@types/responseType';

/*
	feeds endpoint in backend should return an array, it is currently returning an object. So this code must be changed later to accommodate an array of feeds.
*/
export type FeedType = {
	_id: string;
	likes: number;
	isLiked: boolean;
	createdBy: ProfileReference;
	createdAt: Date;
	contents: {
		public_id: string;
		secure_url: string;
	}[];
	commentsCount: number;
	caption: string;
};

const initialState: FeedType[] = [];

export const feedsSlice = createSlice({
	name: 'feeds',
	initialState,
	reducers: {
		setFeeds: (state, action: PayloadAction<FeedType[]>) => {
			return state.concat(action.payload);
		},
		likePost: (state, action: PayloadAction<number>) => {
			state[action.payload].likes += 1;
			state[action.payload].isLiked = true;
		},
		unlikePost: (state, action: PayloadAction<number>) => {
			state[action.payload].likes -= 1;
			state[action.payload].isLiked = false;
		},
	},
});

// Export action creators
export const { setFeeds, likePost, unlikePost } = feedsSlice.actions;

// Export reducers
export default feedsSlice.reducer;
