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
		logout: builder.mutation<ResponseType, null>({
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
	}),
});

export const {
	useLoginMutation,
	useLogoutMutation,
	useRegisterMutation,
	useGetUserDetailsQuery,
	useGetRefreshTokenQuery,
} = authApiSlice;
