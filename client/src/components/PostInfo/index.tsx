import {
	Box,
	Button,
	IconButton,
	Modal,
	Snackbar,
	Typography,
} from '@mui/material';
import {
	EmailIcon,
	EmailShareButton,
	FacebookIcon,
	FacebookShareButton,
	InstapaperIcon,
	InstapaperShareButton,
	LinkedinIcon,
	LinkedinShareButton,
	RedditIcon,
	RedditShareButton,
	TelegramIcon,
	TelegramShareButton,
	TwitterIcon,
	TwitterShareButton,
} from 'react-share';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Favorite, FavoriteBorder, Share } from '@mui/icons-material';

import {
	useLikePostMutation,
	useUnlikePostMutation,
} from '../../features/post/postApiSlice';
import getTimeDiff from '../../utils/getTimeDiff';
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
	const auth = useAppSelector((state) => state.auth);
	const [openAlert, setOpenAlert] = useState<boolean>(false);

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
		<Box>
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
							auth.profilePic === ''
								? defaultProfilePic
								: auth.profilePic
						}
					/>
					<Link to={`/profile/${auth.username}`}>
						<Typography
							variant="body1"
							color="#4E5D78"
							fontWeight="500"
						>
							{auth.username}
						</Typography>
					</Link>
				</Box>

				<Box sx={{ display: 'flex', gap: '16px' }}>
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

			<Modal
				open={open}
				onClose={() => setOpen(false)}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box
					sx={{
						position: 'absolute' as 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						bgcolor: 'background.paper',
						boxShadow: 24,
						maxWidth: '500px',
						padding: '16px',
						borderRadius: '5px',
						border: 'transparent',
					}}
				>
					<Box
						sx={{
							overflowX: 'auto',
							whiteSpace: 'nowrap',

							/* ===== Scrollbar ===== */
							/* Firefox */
							scrollbarWidth: 'thin',
							scrollbarColor: '#077adb transparent',

							/* Chrome, Edge, and Safari */
							'::-webkit-scrollbar': {
								height: '14px',
							},
							'::-webkit-scrollbar-track': {
								background: 'transparent',
								width: '24px',
							},
							'::-webkit-scrollbar-thumb': {
								borderRadius: '16px',
								backgroundColor: '#077adb',
								border: '3px solid transparent',
								backgroundClip: 'padding-box',
							},
						}}
					>
						<EmailShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<EmailIcon size="64px" round />
							<Typography>Email</Typography>
						</EmailShareButton>

						<FacebookShareButton
							url={location.href}
							quote="Github"
							style={{ padding: '8px' }}
						>
							<FacebookIcon size="64px" round />
							<Typography>Facebook</Typography>
						</FacebookShareButton>

						<InstapaperShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<InstapaperIcon size="64px" round />
							<Typography>Instagram</Typography>
						</InstapaperShareButton>

						<LinkedinShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<LinkedinIcon size="64px" round />
							<Typography>LinkedIn</Typography>
						</LinkedinShareButton>

						<RedditShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<RedditIcon size="64px" round />
							<Typography>Reddit</Typography>
						</RedditShareButton>

						<TelegramShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<TelegramIcon size="64px" round />
							<Typography>Telegram</Typography>
						</TelegramShareButton>

						<TwitterShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<TwitterIcon size="64px" round />
							<Typography>Twitter</Typography>
						</TwitterShareButton>
					</Box>
					<Box
						sx={{
							width: '100%',
							display: 'flex',
							padding: '8px',
							borderRadius: '8px',
							background: '#eeeeee',
							marginTop: '24px',
						}}
					>
						<input
							style={{
								width: '100%',
								background: 'none',
								border: 'none',
								outline: 'none',
								fontSize: '15px',
								letterSpacing: '0.015rem',
							}}
							value={location.href}
							readOnly
						/>
						<Button
							variant="contained"
							onClick={() => {
								navigator.clipboard.writeText(location.href);
								setOpenAlert(true);
							}}
						>
							Copy
						</Button>
					</Box>
				</Box>
			</Modal>
			<Snackbar
				open={openAlert}
				autoHideDuration={3000}
				onClose={() => setOpenAlert(false)}
				message="Link copied to clipboard"
			/>
		</Box>
	);
};

export default PostInfo;
