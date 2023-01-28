import type {
	BaseQueryFn,
	FetchArgs,
	FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { RootState } from '../../app/store';
import { logout, setCredentials } from '../auth/authSlice';
import { ResponseType } from '../../@types/responseType';

// Instantiate a new mutex object
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
	baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api`,
	prepareHeaders(headers, { getState }) {
		const token = (getState() as RootState).auth.accessToken;

		headers.set('authorization', `Bearer ${token}`);

		return headers;
	},
});

/*
	1. Make a request to the provided url
	2. If a there is a 401 error, accessToken is refreshed by hitting '/refresh-token' endpoint
	3. If this returns a 401 error, logout
	4. Else set the new credentials provided by '/refresh-token and make a request to the provided url again
*/

const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	// wait until the mutex is available without locking it
	await mutex.waitForUnlock();

	// Make a request
	let result = await baseQuery(args, api, extraOptions);

	// If the request returned a 401 error
	if (result.error && result.error.status === 401) {
		// checking whether the mutex is locked
		if (!mutex.isLocked()) {
			// Lock the mutex
			const release = await mutex.acquire();

			try {
				// try to get a new token
				const refreshResult: any = await baseQuery(
					{ url: '/auth/refresh-token', credentials: 'include' },
					api,
					extraOptions
				);

				if (refreshResult.data) {
					api.dispatch(
						setCredentials({
							...refreshResult.data.data.userObj,
							accessToken: refreshResult.data.token,
							isAuthenticated: true,
						})
					);

					// retry the initial query
					result = await baseQuery(args, api, extraOptions);
				} else {
					api.dispatch(logout());
				}
			} finally {
				// release the mutex
				release();
			}
		} else {
			// wait until the mutex is available without locking it
			await mutex.waitForUnlock();
			result = await baseQuery(args, api, extraOptions);
		}
	}

	return result;
};

export const apiSlice = createApi({
	baseQuery: baseQueryWithReauth,
	endpoints: (builder) => ({}),
});
