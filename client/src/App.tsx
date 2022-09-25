import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import IsUserLoggedIn from './components/Auth/IsUserLoggedIn';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));

import { useAppDispatch } from './app/hooks';
import { setCredentials } from './features/auth/authSlice';
import { useGetRefreshTokenQuery } from './features/auth/authApiSlice';

const App: React.FC = () => {
	const dispatch = useAppDispatch();
	const { data, isSuccess } = useGetRefreshTokenQuery();

	useEffect(() => {
		if (isSuccess) {
			dispatch(
				setCredentials({
					email: data.data.userObj.email,
					username: data.data.userObj.username,
					accessToken: data.token,
					isAuthenticated: true,
				})
			);
		}
	}, [data, isSuccess]);

	return (
		<Suspense fallback={<p>Loading...</p>}>
			<Routes>
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<HomePage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/login"
					element={
						<IsUserLoggedIn>
							<LoginPage />
						</IsUserLoggedIn>
					}
				/>
				<Route
					path="/signup"
					element={
						<IsUserLoggedIn>
							<SignupPage />
						</IsUserLoggedIn>
					}
				/>
			</Routes>
		</Suspense>
	);
};

export default App;
