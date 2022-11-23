import axios from 'axios';
import { useEffect } from 'react';
import { Box } from '@mui/system';
import { Grid } from '@mui/material';
import { useParams } from 'react-router-dom';

import {
	CommentType,
	useLazyGetPostByIdQuery,
} from '../features/post/postApiSlice';
import Comment from '../components/Comment';
import Carousel from '../components/Carousel';
import PostInfo from '../components/PostInfo';
import WidgetSection from '../components/WidgetSection';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addComment, setPost } from '../features/post/postSlice';

const SingleCommentPage = () => {
	const dispatch = useAppDispatch();
	const { commentId } = useParams();
	const post = useAppSelector((state) => state.post);
	const auth = useAppSelector((state) => state.auth);
	const [trigger, { data, isSuccess }] = useLazyGetPostByIdQuery();

	useEffect(() => {
		(async () => {
			const result = await axios.get<{
				success: boolean;
				data: {
					comment: CommentType;
				};
				error: string;
			}>('http://localhost:8000/api/comments/comment', {
				headers: { Authorization: `Bearer ${auth.accessToken}` },
				params: { commentId },
			});

			if (result.data.success) {
				await trigger(result.data.data.comment.postId);
			}

			if (isSuccess && data) {
				dispatch(setPost({ ...data.data.post }));
				dispatch(addComment(result.data.data.comment));
			}
		})();
	}, [data]);

	return (
		<Grid container spacing={2}>
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
				{isSuccess && (
					<Box>
						<Box sx={{ paddingX: { xs: '8px', md: '24px' } }}>
							<Carousel contents={post.contents} />
						</Box>

						<Box sx={{ paddingX: { xs: '8px', md: '24px' } }}>
							<PostInfo />
						</Box>
						<Box
							sx={{
								padding: { xs: '32px 8px ', md: '32px 24px' },
							}}
						>
							{post.comments.length > 0 && (
								<Comment comment={post.comments[0]} index={0} />
							)}
						</Box>
					</Box>
				)}
			</Grid>
			<Grid item xs={0} lg={4}>
				<WidgetSection />
			</Grid>
		</Grid>
	);
};

export default SingleCommentPage;
