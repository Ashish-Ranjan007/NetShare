import axios from 'axios';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Avatar, Box, CircularProgress, Grid, Typography } from '@mui/material';

import getTimeDiff from '../utils/getTimeDiff';
import WidgetSection from '../components/WidgetSection';
import { NotificationType } from '../@types/responseType';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { resetNotifications } from '../features/auth/authSlice';
import { setNotificaitons } from '../features/notifications/notificationSlice';

const customScrollbar = {
	/* width */
	'::-webkit-scrollbar': {
		width: '8px',
	},

	/* Track */
	'::-webkit-scrollbar-track': {
		background: '#f1f1f1',
	},

	/* Handle */
	'::-webkit-scrollbar-thumb': {
		background: '#888',
	},

	/* Handle on hover */
	'::-webkit-scrollbar-thumb:hover': {
		background: '#555',
	},
};

const NotificationPage = () => {
	const [page, setPage] = useState<number>(0);
	const [hasMore, setHasMore] = useState<boolean>(true);

	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);
	const notifications = useAppSelector((state) => state.notifications);

	const fetchMore = async () => {
		try {
			const result = await axios.get<{
				success: boolean;
				data: {
					hasPrev: boolean;
					hasNext: boolean;
					notifications: NotificationType[];
				};
				error: string;
			}>('http://localhost:8000/api/notifications', {
				headers: { Authorization: `Bearer ${auth.accessToken}` },
				params: { page: page },
			});

			dispatch(setNotificaitons(result.data.data.notifications));
			setHasMore(result.data.data.hasNext);
			setPage((prev) => prev + 1);
		} catch (error) {
			console.log(error);
			setHasMore(false);
		}
	};

	useEffect(() => {
		if (notifications.length === 0 && hasMore) {
			fetchMore();
		}
	}, [notifications]);

	useEffect(() => {
		if (notifications.length >= auth.notifications) {
			(async () => {
				const result = await axios.post(
					'http://localhost:8000/api/notifications/clear-all',
					{},
					{ headers: { Authorization: `Bearer ${auth.accessToken}` } }
				);

				if (result.data.success) {
					dispatch(resetNotifications());
				}
			})();
		}
	}, [notifications]);

	return (
		<Grid container spacing={2} sx={{ paddingLeft: { sm: '16px' } }}>
			<Grid
				item
				xs={12}
				lg={8}
				sx={{
					height: 'calc(100vh - 75px)',
					overflowY: 'auto',
					...customScrollbar,
				}}
				id="notification-section-scroll"
			>
				<InfiniteScroll
					next={fetchMore}
					hasMore={hasMore}
					dataLength={notifications.length}
					loader={
						<Box sx={{ textAlign: 'center' }}>
							<CircularProgress />
						</Box>
					}
					scrollableTarget="notification-section-scroll"
				>
					{notifications.map((notification, index) => {
						let action;

						if (notification.contentType === 'profile') {
							action = 'started following you';
						} else if (
							notification.contentType === 'post' &&
							notification.action === 'liked'
						) {
							action = (
								<Typography component="span">
									{'liked your '}
									<Link
										style={{
											color: '#1976d2',
											textDecoration: 'underline',
										}}
										to={`/post/${notification.contentId}`}
									>
										post
									</Link>
								</Typography>
							);
						} else if (
							notification.contentType === 'post' &&
							notification.action === 'commented'
						) {
							action = (
								<Typography component="span">
									<Link
										style={{
											color: '#1976d2',
											textDecoration: 'underline',
										}}
										to={`/comment/${notification.contentId}`}
									>
										commented
									</Link>
									{' on your '}
									<Link
										style={{
											color: '#1976d2',
											textDecoration: 'underline',
										}}
										to={`/post/${notification.contentId}`}
									>
										post
									</Link>
								</Typography>
							);
						} else if (
							notification.contentType === 'comment' &&
							notification.action === 'liked'
						) {
							action = (
								<Typography component="span">
									{'liked your '}
									<Link
										style={{
											color: '#1976d2',
											textDecoration: 'underline',
										}}
										to={`/comment/${notification.contentId}`}
									>
										comment
									</Link>
								</Typography>
							);
						} else if (
							notification.contentType === 'comment' &&
							notification.action === 'replied'
						) {
							action = (
								<Typography component="span">
									<Link
										style={{
											color: '#1976d2',
											textDecoration: 'underline',
										}}
										to={`/comment/${notification.contentId}`}
									>
										replied
									</Link>
									{' to your '}
									<Link
										style={{
											color: '#1976d2',
											textDecoration: 'underline',
										}}
										to={`/comment/${notification.contentId}`}
									>
										comment
									</Link>
								</Typography>
							);
						} else {
							return;
						}

						let date;

						if (index === 0) {
							date = getTimeDiff(notification.time);
						} else if (index > 0) {
							if (
								getTimeDiff(notifications[index - 1].time) !==
								getTimeDiff(notification.time)
							) {
								date = getTimeDiff(notification.time);
							}
						}

						return (
							<Box key={notification._id}>
								{date && (
									<Box
										sx={{
											paddingTop: index > 0 ? '16px' : '',
										}}
									>
										{date}
										<hr
											style={{ borderColor: '#f5f5f5' }}
										/>
									</Box>
								)}
								<Box
									key={notification._id}
									sx={{
										display: 'flex',
										alignItems: 'center',
										padding: '8px',
										gap: '16px',
									}}
								>
									<Avatar
										src={notification.user.profilePic}
										alt={`profile picture of ${notification.user.username}`}
									/>
									<Box>
										<Link
											style={{ color: 'inherit' }}
											to={`/profile/${notification.user.username}/${notification.user.id}`}
										>
											{notification.user.username + ' '}
										</Link>
										<Typography component="span">
											{action}
										</Typography>
									</Box>
								</Box>
							</Box>
						);
					})}
				</InfiniteScroll>
				{notifications.length === 0 && (
					<Box>
						<Typography variant="h6" textAlign="center">
							You have no notifications.
						</Typography>
					</Box>
				)}
			</Grid>
			<Grid item xs={0} lg={4}>
				<WidgetSection />
			</Grid>
		</Grid>
	);
};

export default NotificationPage;
