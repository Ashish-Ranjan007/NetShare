import {
	CircularProgress,
	IconButton,
	InputAdornment,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { FormEvent, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import axios from 'axios';
import Comment from '../Comment';
import {
	PostType,
	useAddCommentMutation,
} from '../../features/post/postApiSlice';
import { Send } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addComment, setComments } from '../../features/post/postSlice';

const defaultProfilePic =
	'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80';

const CommentSection = ({ post }: { post: PostType }) => {
	const dispatch = useAppDispatch();
	const [page, setPage] = useState<number>(0);
	const [postAddComment] = useAddCommentMutation();
	const auth = useAppSelector((state) => state.auth);
	const [comment, setComment] = useState<string>('');
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [openAlert, setOpenAlert] = useState<boolean>(false);
	const comments = useAppSelector((state) => state.post.comments);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (comment.length === 0) return;

		const result = await postAddComment({
			postId: post._id,
			content: comment,
		}).unwrap();

		setComment('');
		dispatch(addComment(result.data.comment));
		setOpenAlert(true);
	};

	const fetchMore = async () => {
		const result = await axios.get(
			'http://localhost:8000/api/posts/comments',
			{
				headers: { Authorization: `Bearer ${auth.accessToken}` },
				params: { postId: post._id, page: page },
			}
		);

		dispatch(setComments(result.data.data.comments));
		setPage((prev) => prev + 1);
		setHasMore(result.data.data.comments.length > 0 ? true : false);
	};

	useEffect(() => {
		if (comments.length === 0 && post) {
			fetchMore();
		}
	}, [comments, post]);

	return (
		<Box sx={{ padding: { xs: '8px', md: '24px' } }}>
			<Typography
				variant="body1"
				sx={{ paddingBottom: '24px', fontWeight: '500' }}
			>
				{post.commentsCount} Comments
			</Typography>

			<Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
				<Box
					sx={{
						width: '32px',
						height: '32px',
						borderRadius: '100%',
						marginRight: '16px',
					}}
					component="img"
					src={
						auth.profilePic.length > 0
							? auth.profilePic
							: defaultProfilePic
					}
				/>

				<form
					style={{ width: '100%', display: 'flex' }}
					onSubmit={handleSubmit}
				>
					<TextField
						sx={{ width: '100%' }}
						id="input-with-sx"
						variant="standard"
						placeholder="Add a comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						InputProps={{
							endAdornment: (
								<InputAdornment position="start">
									<IconButton type="submit">
										<Send />
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
				</form>
			</Box>

			<Box sx={{ marginTop: '24px' }}>
				<InfiniteScroll
					dataLength={comments.length}
					next={fetchMore}
					hasMore={hasMore}
					loader={
						<Box sx={{ textAlign: 'center' }}>
							<CircularProgress />
						</Box>
					}
					scrollableTarget="scrollable-comment-section"
				>
					{comments.map((item, index) => (
						<Comment key={item._id} comment={item} index={index} />
					))}
				</InfiniteScroll>
			</Box>

			<Snackbar
				open={openAlert}
				autoHideDuration={4000}
				onClose={() => setOpenAlert(false)}
				message="Comment is added"
			/>
		</Box>
	);
};

export default CommentSection;
