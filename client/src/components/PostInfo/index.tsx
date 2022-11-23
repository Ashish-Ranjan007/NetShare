import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import { Favorite, FavoriteBorder, Share } from '@mui/icons-material';

import {
	useLikePostMutation,
	useUnlikePostMutation,
} from '../../features/post/postApiSlice';
import getTimeDiff from '../../utils/getTimeDiff';
import ShareOptionsModal from '../ShareOptionsModal';
import { setLikePost } from '../../features/post/postSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

const defaultProfilePic =
	'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80';

const PostInfo = () => {
	const dispatch = useAppDispatch();
	const [likePost] = useLikePostMutation();
	const [unlikePost] = useUnlikePostMutation();
	const [open, setOpen] = useState<boolean>(false);
	const post = useAppSelector((state) => state.post);

	const handleClick = async () => {
		if (!post.isLiked) {
			const result = await likePost(post._id).unwrap();

			if (result.success) {
				dispatch(setLikePost('like'));
			}
		} else {
			const result = await unlikePost(post._id).unwrap();

			if (result.success) {
				dispatch(setLikePost('unlike'));
			}
		}
	};

	return (
		<Box sx={{ marginTop: '24px' }}>
			<Typography variant="body1">{post.caption}</Typography>

			<Typography variant="body2" sx={{ paddingTop: '24px' }}>
				{post.createdAt ? getTimeDiff(post.createdAt) : ''}
			</Typography>

			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					paddingTop: '24px',
				}}
			>
				<Box
					sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}
				>
					<Box
						sx={{
							width: '32px',
							height: '32px',
							borderRadius: '100%',
						}}
						component="img"
						src={
							post.createdBy.profilePic === ''
								? defaultProfilePic
								: post.createdBy.profilePic
						}
					/>
					<Link
						to={`/profile/${post.createdBy.username}/${post.createdBy.id}`}
					>
						<Typography
							variant="body1"
							color="#4E5D78"
							fontWeight="500"
						>
							{post.createdBy.username}
						</Typography>
					</Link>
				</Box>

				<Box sx={{ display: 'flex', gap: { xs: '8px', md: '16px' } }}>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<Typography variant="body1">
							{post.likes} Likes
						</Typography>
						<IconButton onClick={handleClick}>
							{post.isLiked ? (
								<Favorite sx={{ color: '#077adb' }} />
							) : (
								<FavoriteBorder />
							)}
						</IconButton>
					</Box>

					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<Typography variant="body1">Share</Typography>

						<IconButton onClick={() => setOpen(true)}>
							<Share sx={{ cursor: 'pointer' }} />
						</IconButton>
					</Box>
				</Box>
			</Box>

			<ShareOptionsModal
				url={location.href}
				open={open}
				onClose={() => setOpen(false)}
			/>
		</Box>
	);
};

export default PostInfo;
