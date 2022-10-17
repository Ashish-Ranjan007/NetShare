import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
	email: string;
	username: string;
	profilePic: string;
	accessToken: string;
	recentSearches: {
		id: string;
		profilePic: string;
		username: string;
	}[];
	isAuthenticated: boolean | null;
};

const initialState: AuthState = {
	email: '',
	username: '',
	profilePic: '',
	accessToken: '',
	recentSearches: [],
	isAuthenticated: null,
};

export const authSlice = createSlice({
	name: 'auth',
	initialState: initialState,
	reducers: {
		setCredentials: (state, action: PayloadAction<AuthState>) => {
			const {
				email,
				username,
				accessToken,
				isAuthenticated,
				profilePic,
				recentSearches,
			} = action.payload;

			state.email = email;
			state.username = username;
			state.profilePic = profilePic;
			state.accessToken = accessToken;
			state.recentSearches = recentSearches;
			state.isAuthenticated = isAuthenticated;
		},
		logout: (state) => {
			state.email = '';
			state.username = '';
			state.profilePic = '';
			state.accessToken = '';
			state.recentSearches = [];
			state.isAuthenticated = false;
		},
	},
});

// Export action creators
export const { setCredentials, logout } = authSlice.actions;

// Export reducers
export default authSlice.reducer;
