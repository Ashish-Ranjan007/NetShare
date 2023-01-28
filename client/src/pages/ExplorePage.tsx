import axios from 'axios';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { CircularProgress, Grid, Typography } from '@mui/material';

import { Box } from '@mui/system';
import WidgetSection from '../components/WidgetSection';
import { PostType } from '../features/post/postApiSlice';
import InfiniteScroll from 'react-infinite-scroll-component';

const ExplorePage = () => {
	const auth = useAppSelector((state) => state.auth);

	const [page, setPage] = useState<number>(0);
	const [posts, setPosts] = useState<PostType[]>([]);
	const [hasMore, setHasMore] = useState<boolean>(true);

	const fetchMore = async () => {
		try {
			const result = await axios.get<{
				success: boolean;
				data: { hasPrev: boolean; hasNext: boolean; posts: PostType[] };
				error: string;
			}>(`${import.meta.env.VITE_API_BASE_URL}/api/posts/explore`, {
				headers: { Authorization: `Bearer ${auth.accessToken}` },
				params: { page: page },
			});

			setPosts((prev) => [...prev, ...result.data.data.posts]);
			setHasMore(result.data.data.hasNext);
			setPage((prev) => prev + 1);
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
		default: 2,
		600: 1,
	};

	return (
		<Grid container spacing={2} sx={{ paddingLeft: { sm: '16px' } }}>
			<Grid
				id="scrollable-comment-section"
				item
				xs={12}
				lg={8}
				sx={{
					height: 'calc(100vh - 75px)',
					overflowY: 'scroll',
					'&::-webkit-scrollbar': { display: 'none' },
					scrollbarWidth: 'none',
				}}
			>
				<InfiniteScroll
					next={fetchMore}
					hasMore={hasMore}
					dataLength={posts.length}
					loader={
						<Box sx={{ textAlign: 'center' }}>
							<CircularProgress />
						</Box>
					}
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
					}}
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
											src={post.contents[0].secure_url}
											component="img"
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
				{posts.length === 0 && (
					<Box>
						<Typography variant="h6" textAlign="center">
							There are no posts available to explore.
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

export default ExplorePage;
