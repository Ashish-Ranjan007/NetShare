import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import IsUserLoggedIn from './components/Auth/IsUserLoggedIn';

const Layout = lazy(() => import('./pages/Layout'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));

import { useAppDispatch, useAppSelector } from './app/hooks';
import { logout, setCredentials } from './features/auth/authSlice';
import { useGetRefreshTokenQuery } from './features/auth/authApiSlice';
import {
	EXPLORE,
	FEED,
	LOGIN,
	MESSAGES,
	NOTIFICATIONS,
	PROFILE,
	SETTINGS,
	SIGNUP,
	SEARCH,
	FRIENDS,
} from './constants/routes';

const App: React.FC = () => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);
	const { data, isSuccess, isError } = useGetRefreshTokenQuery();

	useEffect(() => {
		if (isSuccess) {
			dispatch(
				setCredentials({
					...data.data.userObj,
					accessToken: data.token,
					isAuthenticated: true,
				})
			);
		}

		if (isError) {
			dispatch(logout());
		}
	}, [data, isSuccess]);

	return (
		<Suspense fallback={<p>Loading...</p>}>
			{auth.isAuthenticated !== null && (
				<Routes>
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<Layout />
							</ProtectedRoute>
						}
					>
						<Route path={FEED} element={<FeedPage />} />
						<Route path={EXPLORE} element={<ExplorePage />} />
						<Route path={MESSAGES} element={<MessagesPage />} />
						<Route
							path={NOTIFICATIONS}
							element={<NotificationPage />}
						/>
						<Route path={FRIENDS} element={<FriendsPage />} />
						<Route path={PROFILE} element={<ProfilePage />} />
						<Route path={SETTINGS} element={<SettingsPage />} />
						<Route path={SEARCH} element={<SearchResultsPage />} />
					</Route>
					<Route
						path={LOGIN}
						element={
							<IsUserLoggedIn>
								<LoginPage />
							</IsUserLoggedIn>
						}
					/>
					<Route
						path={SIGNUP}
						element={
							<IsUserLoggedIn>
								<SignupPage />
							</IsUserLoggedIn>
						}
					/>
				</Routes>
			)}
		</Suspense>
	);
};

export default App;
