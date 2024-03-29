import { useEffect } from 'react';
import { Grid, Box, Button } from '@mui/material';
import { useParams } from 'react-router-dom';

import Carousel from '../components/Carousel';
import PostInfo from '../components/PostInfo';
import { setPost } from '../features/post/postSlice';
import WidgetSection from '../components/WidgetSection';
import CommentSection from '../components/CommentSection';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useGetPostByIdQuery } from '../features/post/postApiSlice';
import DeletePost from '../components/DeletePost';

const SinglePostPage = () => {
	const { postId } = useParams();
	const dispatch = useAppDispatch();
	const post = useAppSelector((state) => state.post);
	const { data, isSuccess } = useGetPostByIdQuery(postId || '');

	useEffect(() => {
		if (isSuccess) {
			dispatch(setPost({ ...data.data.post }));
		}
	}, [isSuccess]);

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
				{post && (
					<Box>
						<Box sx={{ paddingX: { xs: '8px', md: '24px' } }}>
							<Carousel contents={post.contents} />
						</Box>

						<Box sx={{ paddingX: { xs: '8px', md: '24px' } }}>
							<PostInfo />
						</Box>

						<DeletePost />

						{post._id.length > 0 && <CommentSection post={post} />}
					</Box>
				)}
			</Grid>
			<Grid item xs={0} lg={4}>
				<WidgetSection />
			</Grid>
		</Grid>
	);
};

export default SinglePostPage;
