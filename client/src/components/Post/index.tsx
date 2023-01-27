import {
	Avatar,
	Box,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	CardMedia,
	Dialog,
	Divider,
	IconButton,
	Snackbar,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { Stack } from '@mui/system';
import { Link } from 'react-router-dom';
import {
	Comment,
	Favorite,
	FavoriteBorderOutlined,
	MoreVert,
	Share,
} from '@mui/icons-material';

import getTimeDiff from '../../utils/getTimeDiff';
import {
	FeedType,
	likePost,
	unlikePost,
} from '../../features/feeds/feedsSlice';
import { useUnFollowMutation } from '../../features/auth/authApiSlice';
import Carousel from '../Carousel';
import {
	useLikePostMutation,
	useUnlikePostMutation,
} from '../../features/post/postApiSlice';
import { useAppDispatch } from '../../app/hooks';
import ShareOptionsModal from '../ShareOptionsModal';

const Post = ({ post, index }: { post: FeedType; index: number }) => {
	const dispatch = useAppDispatch();
	const [postUnfollow] = useUnFollowMutation();
	const [postLikePost] = useLikePostMutation();
	const [postUnlikePost] = useUnlikePostMutation();

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openAlert, setOpenAlert] = useState<boolean>(false);
	const [openOptions, setOpenOptions] = useState<boolean>(false);

	const handleLike = async () => {
		if (post.isLiked) {
			const returned = await postUnlikePost(post._id).unwrap();

			if (returned.success) {
				dispatch(unlikePost(index));
			}
		} else {
			const returned = await postLikePost(post._id).unwrap();

			if (returned.success) {
				dispatch(likePost(index));
			}
		}
	};

	const handleUnFollow = async () => {
		const returned = await postUnfollow(post.createdBy.id).unwrap();

		if (returned.success) {
			setOpenAlert(true);
		}

		setOpenOptions(false);
	};

	return (
		<Card
			sx={{ maxWidth: '500px', marginX: 'auto', marginBottom: '24px' }}
			variant="outlined"
		>
			<CardHeader
				avatar={<Avatar src={post.createdBy.profilePic} />}
				action={
					<IconButton
						aria-label="settings"
						onClick={() => setOpenOptions(true)}
					>
						<MoreVert />
					</IconButton>
				}
				title={
					<Link
						style={{ color: 'inherit', fontWeight: '500' }}
						to={`/profile/${post.createdBy.username}/${post.createdBy.id}`}
					>
						{post.createdBy.username}
					</Link>
				}
				subheader={getTimeDiff(post.createdAt)}
			/>
			<CardMedia>
				<Carousel contents={post.contents} />
			</CardMedia>
			<CardContent>
				<Link
					to={`/profile/${post.createdBy.username}/${post.createdBy.id}`}
					style={{ color: 'inherit' }}
				>
					<Typography component="span">
						{post.createdBy.username}:{' '}
					</Typography>
				</Link>
				<Typography
					component="span"
					variant="body2"
					color="text.secondary"
					sx={{ wordWrap: 'break-word' }}
				>
					{post.caption}
				</Typography>
			</CardContent>
			<CardActions sx={{ justifyContent: 'space-between' }}>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<IconButton
						aria-label="add to favorites"
						onClick={handleLike}
					>
						{post.isLiked ? (
							<Favorite sx={{ color: '#1976d2' }} />
						) : (
							<FavoriteBorderOutlined />
						)}
					</IconButton>
					<Typography>{post.likes} Likes</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<IconButton aria-label="add to favorites">
						<Link
							to={`/post/${post._id}`}
							style={{
								color: 'inherit',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<Comment />
						</Link>
					</IconButton>
					<Typography>{post.commentsCount} Comments</Typography>
				</Box>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<IconButton
						aria-label="add to favorites"
						onClick={() => setOpenModal(true)}
					>
						<Share />
					</IconButton>
					<Typography>Share</Typography>
				</Box>
			</CardActions>
			<Dialog open={openOptions} onClose={() => setOpenOptions(false)}>
				<Stack
					sx={{
						width: '300px',
						alignItems: 'center',
					}}
					divider={<Divider orientation="horizontal" flexItem />}
				>
					<Typography
						color="error"
						variant="body1"
						onClick={handleUnFollow}
						sx={{
							width: '100%',
							cursor: 'pointer',
							padding: '12px',
							':hover': {
								backgroundColor: '#eee',
							},
							textAlign: 'center',
							transition: 'all 300ms ease',
						}}
					>
						Unfollow
					</Typography>
					<Link
						style={{ width: '100%', color: 'inherit' }}
						to={`/post/${post._id}`}
					>
						<Typography
							sx={{
								width: '100%',
								cursor: 'pointer',
								padding: '12px',
								':hover': {
									backgroundColor: '#eee',
								},
								textAlign: 'center',
								transition: 'all 300ms ease',
							}}
						>
							Go to post
						</Typography>
					</Link>
					<Typography
						sx={{
							width: '100%',
							cursor: 'pointer',
							padding: '12px',
							':hover': {
								backgroundColor: '#eee',
							},
							textAlign: 'center',
							transition: 'all 300ms ease',
						}}
						onClick={() => setOpenOptions(false)}
					>
						Cancel
					</Typography>
				</Stack>
			</Dialog>
			<Snackbar
				open={openAlert}
				autoHideDuration={3000}
				onClose={() => setOpenAlert(false)}
				message={`${post.createdBy.username} is unfollowed`}
			/>

			<ShareOptionsModal
				url={`http://localhost:5173/post/${post._id}`}
				open={openModal}
				onClose={() => setOpenModal(false)}
			/>
		</Card>
	);
};

export default Post;
