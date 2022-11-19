import { apiSlice } from '../api/apiSlice';

import { ResponseType } from '../../@types/responseType';

type LoginType = {
	email: string;
	password: string;
};

type RegisterType = {
	email: string;
	firstname: string;
	lastname: string;
	username: string;
	password: string;
	confirmPassword: string;
};

const authApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation<ResponseType, LoginType>({
			query: (userData) => ({
				url: '/auth/login',
				method: 'POST',
				body: userData,
				credentials: 'include',
			}),
		}),
		register: builder.mutation<ResponseType, RegisterType>({
			query: (userData) => ({
				url: '/auth/register',
				method: 'POST',
				body: userData,
				credentials: 'include',
			}),
		}),
		logout: builder.mutation<ResponseType, void>({
			query: () => ({
				method: 'POST',
				url: '/auth/logout',
				credentials: 'include',
			}),
		}),
		getRefreshToken: builder.query<ResponseType, void>({
			query: () => ({
				url: '/auth/refresh-token',
				credentials: 'include',
			}),
		}),
		getUserDetails: builder.query<ResponseType, void>({
			query: () => ({
				url: '/auth/whoami',
			}),
		}),
		unFollow: builder.mutation<
			{ success: boolean; data: {}; error: string },
			string
		>({
			query: (userId) => ({
				url: '/auth/unfollow',
				method: 'POST',
				body: { targetId: userId },
			}),
		}),
	}),
});

export const {
	useLoginMutation,
	useLogoutMutation,
	useRegisterMutation,
	useGetUserDetailsQuery,
	useGetRefreshTokenQuery,
	useUnFollowMutation,
} = authApiSlice;
