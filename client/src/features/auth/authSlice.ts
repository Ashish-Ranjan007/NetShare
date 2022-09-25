import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
	email: string;
	username: string;
	accessToken: string;
	isAuthenticated: boolean;
};

const initialState: AuthState = {
	email: '',
	username: '',
	accessToken: '',
	isAuthenticated: false,
};

export const authSlice = createSlice({
	name: 'auth',
	initialState: initialState,
	reducers: {
		setCredentials: (state, action: PayloadAction<AuthState>) => {
			const { email, username, accessToken, isAuthenticated } =
				action.payload;

			state.email = email;
			state.username = username;
			state.accessToken = accessToken;
			state.isAuthenticated = isAuthenticated;
		},
		logout: (state) => {
			state.email = '';
			state.username = '';
			state.accessToken = '';
			state.isAuthenticated = false;
		},
	},
});

// Export action creators
export const { setCredentials, logout } = authSlice.actions;

// Export reducers
export default authSlice.reducer;
