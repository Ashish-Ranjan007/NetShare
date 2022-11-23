import { ProfileReference } from '../../@types/responseType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
	id: string;
	bio: string;
	email: string;
	username: string;
	firstname: string;
	lastname: string;
	profilePic: string;
	accessToken: string;
	postsCount: number;
	friendsCount: number;
	notifications: number;
	followersCount: number;
	followingsCount: number;
	friends: ProfileReference[];
	followers: ProfileReference[];
	followings: ProfileReference[];
	isAuthenticated: boolean | null;
	recentSearches: ProfileReference[];
};

const initialState: AuthState = {
	id: '',
	bio: '',
	email: '',
	friends: [],
	username: '',
	firstname: '',
	lastname: '',
	followers: [],
	followings: [],
	profilePic: '',
	accessToken: '',
	postsCount: 0,
	friendsCount: 0,
	followersCount: 0,
	notifications: 0,
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
		resetNotifications: (state) => {
			state.notifications = 0;
		},
	},
});

// Export action creators
export const { setCredentials, logout, setRecentSearches, resetNotifications } =
	authSlice.actions;

// Export reducers
export default authSlice.reducer;
