import { useEffect } from 'react';

import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useGetRefreshTokenQuery } from '../features/auth/authApiSlice';

export function useRefreshToken() {
	const dispatch = useAppDispatch();
	const { data, isSuccess } = useGetRefreshTokenQuery('');

	useEffect(() => {
		if (isSuccess) {
			dispatch(
				setCredentials({
					email: data.data.userObj.email,
					username: data.data.userObj.username,
					accessToken: data.data.token,
					isAuthenticated: true,
				})
			);
		}
	}, [data, isSuccess]);
}
