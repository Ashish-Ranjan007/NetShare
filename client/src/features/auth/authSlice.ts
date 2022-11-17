import { ProfileReference, NotificationType } from '../../@types/responseType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
	id: string;
	email: string;
	username: string;
	profilePic: string;
	accessToken: string;
	postsCount: number;
	friendsCount: number;
	followersCount: number;
	followingsCount: number;
	friends: ProfileReference[];
	followers: ProfileReference[];
	followings: ProfileReference[];
	isAuthenticated: boolean | null;
	notifications: NotificationType[];
	recentSearches: ProfileReference[];
};

const initialState: AuthState = {
	id: '',
	email: '',
	friends: [],
	username: '',
	followers: [],
	followings: [],
	profilePic: '',
	accessToken: '',
	postsCount: 0,
	friendsCount: 0,
	followersCount: 0,
	notifications: [],
	followingsCount: 0,
	recentSearches: [],
	isAuthenticated: null,
};

export const authSlice = createSlice({
	name: 'auth',
	initialState: initialState,
	reducers: {
		setCredentials: (state, action: PayloadAction<AuthState>) => {
			return action.payload;
		},
		logout: (state) => {
			return { ...initialState, isAuthenticated: false };
		},
		setRecentSearches: (state, action: PayloadAction<ProfileReference>) => {
			state.recentSearches.push(action.payload);
		},
	},
});

// Export action creators
export const { setCredentials, logout, setRecentSearches } = authSlice.actions;

// Export reducers
export default authSlice.reducer;
