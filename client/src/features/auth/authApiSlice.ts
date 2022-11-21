import { apiSlice } from '../api/apiSlice';

import { ProfileReference, ResponseType } from '../../@types/responseType';

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

type UserType = {
	_id: string;
	bio: string;
	username: string;
	firstname: string;
	lastname: string;
	profilePic: string;
	postsCount: number;
	friendsCount: number;
	followersCount: number;
	followingsCount: number;
	isFollowing: boolean;
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
		getUserDetails: builder.query<
			{ success: boolean; data: { user: UserType }; error: string },
			string
		>({
			query: (username) => ({
				url: '/auth/user',
				params: { username: username },
			}),
		}),
		follow: builder.mutation<
			{ success: boolean; data: {}; error: string },
			string
		>({
			query: (userId) => ({
				url: '/auth/follow',
				method: 'POST',
				body: { targetId: userId },
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
		followers: builder.query<
			{
				success: boolean;
				data: {
					hasPrev: boolean;
					hasNext: boolean;
					followers: ProfileReference[];
				};
				error: string;
			},
			string
		>({
			query: (userId) => ({
				url: '/auth/followers',
				params: { userId: userId },
			}),
		}),
		followings: builder.query<
			{
				success: boolean;
				data: {
					hasPrev: boolean;
					hasNext: boolean;
					followings: ProfileReference[];
				};
				error: string;
			},
			string
		>({
			query: (userId) => ({
				url: '/auth/followings',
				params: { userId: userId },
			}),
		}),
	}),
});

export const {
	useLoginMutation,
	useLogoutMutation,
	useRegisterMutation,
	useLazyGetUserDetailsQuery,
	useGetRefreshTokenQuery,
	useFollowMutation,
	useUnFollowMutation,
	useLazyFollowersQuery,
	useLazyFollowingsQuery,
} = authApiSlice;
