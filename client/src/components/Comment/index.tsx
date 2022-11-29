import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Typography,
} from '@mui/material';
import {
	ArrowDropDown,
	ArrowDropUp,
	ThumbUp,
	ThumbUpAltOutlined,
} from '@mui/icons-material';
import axios from 'axios';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { FormEvent, useEffect, useState } from 'react';

import {
	deleteComment,
	replyToComment,
	setLikeComment,
	updateComment,
} from '../../features/post/postSlice';
import {
	useDeleteCommentMutation,
	useLikeCommentMutation,
	useReplyMutation,
	useUnlikeCommentMutation,
	useUpdateCommentMutation,
} from '../../features/comments/commentsApiSlice';
import Reply from '../Reply';
import getTimeDiff from '../../utils/getTimeDiff';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CommentType } from '../../features/post/postApiSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
	ReplyResponseType,
	ReplyType,
} from '../../features/reply/replyApiSlice';
import InputComment from '../InputComment';

const defaultProfilePic =
	'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80';

const Comment = ({
	comment,
	index,
}: {
	comment: CommentType;
	index: number;
}) => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);

	const [postReply] = useReplyMutation();
	const [postLikeComment] = useLikeCommentMutation();
	const [postUnLikeComment] = useUnlikeCommentMutation();
	const [postDeleteComment] = useDeleteCommentMutation();
	const [postUpdateComment] = useUpdateCommentMutation();

	const [page, setPage] = useState<number>(0);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [replyText, setReplyText] = useState<string>('');
	const [replies, setReplies] = useState<ReplyType[]>([]);
	const [openEdit, setOpenEdit] = useState<boolean>(false);
	const [openReply, setOpenReply] = useState<boolean>(false);
	const [openReplies, setOpenReplies] = useState<boolean>(false);
	const [editText, setEditText] = useState<string>(comment.content);
	const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);

	const fetchMore = async () => {
		try {
			const result = await axios.get<ReplyResponseType>(
				'http://localhost:8000/api/comments/replies',
				{
					headers: { Authorization: `Bearer ${auth.accessToken}` },
					params: { commentId: comment._id, page: page },
				}
			);

			setReplies((prev) => prev.concat(result.data.data.replies));
			setPage((prev) => prev + 1);
			setHasMore(result.data.data.hasNext);
		} catch (error) {
			console.log(error);
			setHasMore(false);
		}
	};

	const handleLike = async () => {
		if (comment.isLiked) {
			const result = await postUnLikeComment(comment._id).unwrap();

			if (result.success) {
				dispatch(setLikeComment({ index: index, action: 'unlike' }));
			}
		} else {
			const result = await postLikeComment(comment._id).unwrap();

			if (result.success) {
				dispatch(setLikeComment({ index: index, action: 'like' }));
			}
		}
	};

	const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (editText.length === 0) return;

		const returned = await postUpdateComment({
			commentId: comment._id,
			content: editText,
		}).unwrap();

		if (returned.success) {
			dispatch(
				updateComment({
					index: index,
					newComment: returned.data.comment,
				})
			);
		}

		setOpenEdit(false);
	};

	const handleReply = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (replyText.length === 0) return;

		const returned = await postReply({
			commentId: comment._id,
			content: replyText,
		}).unwrap();

		if (returned.success) {
			dispatch(
				replyToComment({
					index: index,
				})
			);

			setReplies((prev) => {
				return [...prev, { ...returned.data.reply, isLiked: false }];
			});
		}

		setReplyText('');
		setOpenReply(false);
	};

	const handleDelete = async () => {
		setOpenConfirmation(false);

		const result = await postDeleteComment(comment._id).unwrap();

		if (result.success) {
			dispatch(deleteComment(index));
		}
	};

	useEffect(() => {
		if (replies.length === 0 && hasMore) {
			fetchMore();
		}
	}, [replies]);

	return (
		<Box
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
					comment.createdBy.profilePic.length > 0
						? comment.createdBy.profilePic
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
							to={comment.createdBy.username}
						>
							{comment.createdBy.username}
						</Link>
					</Typography>
					<Typography variant="caption">
						{getTimeDiff(comment.createdAt)}
					</Typography>
					<Typography variant="caption">
						{comment.updatedAt ? '(edited)' : null}
					</Typography>
				</Box>
				<Typography>{comment.content}</Typography>
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
							{comment.isLiked ? (
								<ThumbUp
									sx={{ color: '#1976d2' }}
									fontSize="small"
								/>
							) : (
								<ThumbUpAltOutlined fontSize="small" />
							)}
						</IconButton>
						<Typography>
							{comment.likes > 0 ? comment.likes : null}
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
					{comment.createdBy.id === auth.id && (
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
					{comment.createdBy.id === auth.id && (
						<Button
							variant="text"
							color="error"
							onClick={() => setOpenConfirmation(true)}
						>
							Delete
						</Button>
					)}
				</Box>
				{comment.repliesCount > 0 ? (
					<Button
						sx={{ textTransform: 'capitalize' }}
						onClick={() => setOpenReplies((prev) => !prev)}
						startIcon={
							openReplies ? (
								<ArrowDropUp />
							) : (
								<ArrowDropDown sx={{ fontsize: 40 }} />
							)
						}
					>
						{comment.repliesCount} Replies
					</Button>
				) : null}
				<InputComment
					open={openEdit}
					profilePic={comment.createdBy.profilePic}
					value={editText}
					setValue={setEditText}
					handleSubmit={handleEdit}
				/>
				<InputComment
					open={openReply}
					profilePic={comment.createdBy.profilePic}
					value={replyText}
					setValue={setReplyText}
					handleSubmit={handleReply}
				/>

				<Box>
					{openReplies && (
						<InfiniteScroll
							dataLength={replies.length}
							next={fetchMore}
							hasMore={hasMore}
							loader={
								<Box sx={{ textAlign: 'center' }}>
									<CircularProgress />
								</Box>
							}
							scrollableTarget="scrollable-comment-section"
						>
							{replies.map((reply, index) => (
								<Reply
									key={reply._id}
									reply={reply}
									index={index}
									setReplies={setReplies}
								/>
							))}
						</InfiniteScroll>
					)}
				</Box>
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

export default Comment;
