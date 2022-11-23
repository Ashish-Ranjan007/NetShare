import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { ThumbUp, ThumbUpAltOutlined } from '@mui/icons-material';
import { Dispatch, FormEvent, SetStateAction, useState } from 'react';

import {
	ReplyType,
	useDeleteReplyMutation,
	useLikeReplyMutation,
	useReplyToReplyMutation,
	useUnlikeReplyMutation,
	useUpdateReplyMutation,
} from '../../features/reply/replyApiSlice';
import InputComment from '../InputComment';
import getTimeDiff from '../../utils/getTimeDiff';

const defaultProfilePic =
	'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80';

const Reply = ({
	index,
	reply,
	setReplies,
}: {
	index: number;
	reply: ReplyType;
	setReplies: Dispatch<SetStateAction<ReplyType[]>>;
}) => {
	const auth = useAppSelector((state) => state.auth);

	const [postLikeReply] = useLikeReplyMutation();
	const [postEditReply] = useUpdateReplyMutation();
	const [postDeleteReply] = useDeleteReplyMutation();
	const [postUnlikeReply] = useUnlikeReplyMutation();
	const [postReplyToReply] = useReplyToReplyMutation();

	const [replyText, setReplyText] = useState<string>('');
	const [openEdit, setOpenEdit] = useState<boolean>(false);
	const [openReply, setOpenReply] = useState<boolean>(false);
	const [editText, setEditText] = useState<string>(reply.content);
	const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);

	const handleLike = async () => {
		if (reply.isLiked) {
			const returned = await postUnlikeReply(reply._id).unwrap();

			if (returned.success) {
				setReplies((prev) => {
					const result = [...prev];

					result[index].likes -= 1;
					result[index].isLiked = false;

					return result;
				});
			}
		} else {
			const returned = await postLikeReply(reply._id).unwrap();

			if (returned.success) {
				setReplies((prev) => {
					const result = [...prev];

					result[index].likes += 1;
					result[index].isLiked = true;

					return result;
				});
			}
		}
	};

	const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (editText.length === 0) return;

		const returned = await postEditReply({
			replyId: reply._id,
			content: editText,
		}).unwrap();

		if (returned.success) {
			setReplies((prev) => {
				const result = [...prev];
				result[index] = returned.data.reply;

				return result;
			});
		}

		setOpenEdit(false);
	};

	const handleReply = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (replyText.length === 0) return;

		const returned = await postReplyToReply({
			commentId: reply.commentId,
			replyId: reply._id,
			content: replyText,
		}).unwrap();

		if (returned.success) {
			setReplies((prev) => {
				const result = [
					...prev,
					{
						...returned.data.reply,
						isLiked: false,
					},
				];

				return result;
			});
		}

		setReplyText('');
		setOpenReply(false);
	};

	const handleDelete = async () => {
		setOpenConfirmation(false);

		const result = await postDeleteReply(reply._id).unwrap();

		if (result.success) {
			setReplies((prev) => {
				prev = prev.filter((prevArr) => prevArr._id !== reply._id);

				return prev;
			});
		}
	};

	return (
		<Box
			id={reply._id}
			sx={{
				width: '100%',
				display: 'flex',
				alignItems: 'flex-start',
				paddingY: '8px',
			}}
		>
			<Box
				sx={{
					width: '32px',
					height: '32px',
					borderRadius: '100%',
					marginRight: '16px',
				}}
				component="img"
				src={
					reply.createdBy.profilePic.length > 0
						? reply.createdBy.profilePic
						: defaultProfilePic
				}
			/>
			<Box sx={{ width: '100%' }}>
				<Box
					sx={{ display: 'flex', gap: '16px', alignItems: 'center' }}
				>
					<Typography variant="body1" sx={{ fontWeight: '500' }}>
						<Link
							style={{ color: '#4E5D78' }}
							to={reply.createdBy.username}
						>
							{reply.createdBy.username}
						</Link>
					</Typography>
					<Typography variant="caption">
						{getTimeDiff(reply.createdAt)}
					</Typography>
					<Typography variant="caption">
						{reply.updatedAt ? '(edited)' : null}
					</Typography>
				</Box>
				<Box>
					<Typography>
						{reply.repliedTo.replyId && (
							<a
								style={{
									color: '#1976d2',
								}}
								href={`#${reply.repliedTo.replyId}`}
							>
								@{reply.repliedTo.username + ' '}
							</a>
						)}
						{reply.content}
					</Typography>
				</Box>

				<Box
					sx={{
						paddingTop: '2px',
						display: 'flex',
						alignItems: 'center',
						gap: '16px',
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<IconButton onClick={handleLike}>
							{reply.isLiked ? (
								<ThumbUp
									sx={{ color: '#1976d2' }}
									fontSize="small"
								/>
							) : (
								<ThumbUpAltOutlined fontSize="small" />
							)}
						</IconButton>
						<Typography>
							{reply.likes > 0 ? reply.likes : null}
						</Typography>
					</Box>
					<Button
						variant="text"
						color="inherit"
						onClick={() => {
							setOpenEdit(false);
							setOpenReply((prev) => !prev);
						}}
					>
						Reply
					</Button>
					{reply.createdBy.id === auth.id && (
						<Button
							color="inherit"
							variant="text"
							onClick={() => {
								setOpenReply(false);
								setOpenEdit((prev) => !prev);
							}}
						>
							Edit
						</Button>
					)}
					{reply.createdBy.id === auth.id && (
						<Button
							variant="text"
							color="error"
							onClick={() => setOpenConfirmation(true)}
						>
							Delete
						</Button>
					)}
				</Box>
				<InputComment
					open={openEdit}
					profilePic={reply.createdBy.profilePic}
					value={editText}
					setValue={setEditText}
					handleSubmit={handleEdit}
				/>
				<InputComment
					open={openReply}
					profilePic={reply.createdBy.profilePic}
					value={replyText}
					setValue={setReplyText}
					handleSubmit={handleReply}
				/>
			</Box>
			<Dialog
				open={openConfirmation}
				onClose={() => setOpenConfirmation(false)}
				aria-labelledby="confirm deletion"
				aria-describedby="Click on confirm to proceed deletion of comment"
			>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure, you want to delete this comment ?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenConfirmation(false)}>
						Discard
					</Button>
					<Button onClick={handleDelete} color="error">
						Confirm
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default Reply;
