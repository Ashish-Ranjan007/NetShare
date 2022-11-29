import axios from 'axios';
import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';

import Post from '../Post';
import { setFeeds } from '../../features/feeds/feedsSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

const FeedSection = () => {
	const dispatch = useAppDispatch();

	const auth = useAppSelector((state) => state.auth);
	const feeds = useAppSelector((state) => state.feeds);

	const [page, setPage] = useState<number>(0);
	const [hasMore, setHasMore] = useState<boolean>(true);

	const fetchMore = async () => {
		try {
			const result = await axios.get(
				'http://localhost:8000/api/home/feeds/',
				{
					headers: {
						Authorization: `Bearer ${auth.accessToken}`,
					},
					params: {
						page: page,
					},
				}
			);

			dispatch(setFeeds(result.data.data.posts));
			setHasMore(result.data.data.hasNext);
			setPage((prev) => prev + 1);
		} catch (error) {
			console.log(error);
			setHasMore(false);
		}
	};

	useEffect(() => {
		if (feeds.length === 0 && hasMore) {
			fetchMore();
		}
	}, []);

	return (
		<Box>
			<InfiniteScroll
				dataLength={feeds.length}
				next={fetchMore}
				hasMore={hasMore}
				loader={
					<Box sx={{ textAlign: 'center' }}>
						<CircularProgress />
					</Box>
				}
			>
				{feeds.map((feed, index) => (
					<Post key={feed._id} post={feed} index={index} />
				))}
			</InfiniteScroll>
		</Box>
	);
};

export default FeedSection;
