import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
	};

	useEffect(() => {
		if (posts.length === 0) {
			fetchMore();
		}
	}, []);

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
				style={{
					width: '100%',
					display: 'flex',
					flexWrap: 'wrap',
				}}
			>
				{posts.map((post) => {
					return (
						<Link to={`/post/${post._id}`} key={post._id}>
							<Box
								sx={{
									width: '200px',
									height: '200px',
									backgroundImage: `url(${post.contents[0].secure_url})`,
									backgroundSize: 'cover',
									backgroundPosition: 'center',
									backgroundRepeat: 'no-repeat',
									margin: '5px',
									':hover': {
										opacity: '0.8',
									},
									transition: 'all 300ms ease',
								}}
							/>
						</Link>
					);
				})}
			</InfiniteScroll>
		</Box>
	);
};

export default UserProfilePostList;
