import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import IsUserLoggedIn from './components/Auth/IsUserLoggedIn';

const Layout = lazy(() => import('./pages/Layout'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const CreatePage = lazy(() => import('./pages/CreatePage'));
const FriendsPage = lazy(() => import('./pages/FriendsPage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SinglePostPage = lazy(() => import('./pages/SinglePostPage'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const SingleCommentPage = lazy(() => import('./pages/SingleCommentPage'));

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
	CREATE,
	POST,
} from './constants/routes';
import EditProfile from './components/Settings/EditProfile';
import DeleteAccount from './components/Settings/DeleteAccount';
import ChangePassword from './components/Settings/ChangePassword';

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
						<Route index element={<FeedPage />} />
						<Route path={EXPLORE} element={<ExplorePage />} />
						<Route path={CREATE} element={<CreatePage />} />
						<Route path={MESSAGES} element={<MessagesPage />} />
						<Route
							path={NOTIFICATIONS}
							element={<NotificationPage />}
						/>
						<Route path={POST} element={<SinglePostPage />} />
						<Route path={FRIENDS} element={<FriendsPage />} />
						<Route path={PROFILE} element={<ProfilePage />} />
						<Route path={SETTINGS} element={<SettingsPage />}>
							<Route index element={<EditProfile />} />
							<Route
								path="change-password"
								element={<ChangePassword />}
							/>
							<Route
								path="delete-account"
								element={<DeleteAccount />}
							/>
						</Route>
						<Route path={SEARCH} element={<SearchResultsPage />} />
						<Route
							path="/comment/:commentId"
							element={<SingleCommentPage />}
						/>
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
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
			)}
		</Suspense>
	);
};

export default App;
