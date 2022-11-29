import axios from 'axios';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useAppSelector } from '../../app/hooks';
import { PostType } from '../../features/post/postApiSlice';

const UserProfilePostList = ({ userId }: { userId: string | undefined }) => {
	const auth = useAppSelector((state) => state.auth);

	const [page, setPage] = useState<number>(0);
	const [posts, setPosts] = useState<PostType[]>([]);
	const [hasMore, setHasMore] = useState<boolean>(true);

	const fetchMore = async () => {
		if (!userId) return;

		try {
			const result = await axios.get<{
				success: boolean;
				data: { hasPrev: boolean; hasNext: boolean; posts: PostType[] };
				error: string;
			}>('http://localhost:8000/api/posts/by-user', {
				headers: { Authorization: `Bearer ${auth.accessToken}` },
				params: { userId: userId, page: page },
			});

			setPosts((prev) => [...prev, ...result.data.data.posts]);
			setPage((prev) => prev + 1);
			setHasMore(result.data.data.hasNext);
		} catch (error) {
			console.log(error);
			setHasMore(false);
		}
	};

	useEffect(() => {
		if (posts.length === 0 && hasMore) {
			fetchMore();
		}
	}, []);

	const breakpoints = {
		default: 3,
		600: 2,
	};

	return (
		<Box>
			<InfiniteScroll
				hasMore={hasMore}
				next={fetchMore}
				dataLength={posts.length}
				loader={
					<Box sx={{ textAlign: 'center' }}>
						<CircularProgress />
					</Box>
				}
			>
				<Masonry
					breakpointCols={breakpoints}
					className="my-masonry-grid"
					columnClassName="my-masonry-grid_column"
				>
					{posts.map((post) => {
						return (
							<Box
								key={post._id}
								sx={{
									':hover': {
										opacity: '0.8',
									},
									transition: 'all 300ms ease',
								}}
							>
								<Link to={`/post/${post._id}`}>
									<Box
										component="img"
										src={post.contents[0].secure_url}
										sx={{
											width: '100%',
											objectFit: 'cover',
										}}
									/>
								</Link>
							</Box>
						);
					})}
				</Masonry>
			</InfiniteScroll>
		</Box>
	);
};

export default UserProfilePostList;
