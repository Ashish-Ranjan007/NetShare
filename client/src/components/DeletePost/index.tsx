import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Modal, Typography } from '@mui/material';

import { deletePost } from '../../features/post/postSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useDeletePostMutation } from '../../features/post/postApiSlice';

const DeletePost = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [postDeletePost, { isLoading }] = useDeletePostMutation();
	const auth = useAppSelector((state) => state.auth);
	const post = useAppSelector((state) => state.post);

	const [openModal, setOpenModal] = useState(false);

	const handleDelete = async () => {
		try {
			const returned = await postDeletePost({
				postId: post._id,
			}).unwrap();

			if (returned.success) {
				dispatch(deletePost());
				navigate('/');
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<Box
			sx={{
				paddingX: { xs: '8px', md: '24px' },
				display: auth._id === post.createdBy._id ? 'block' : 'none',
			}}
		>
			<Button
				color="error"
				sx={{ width: '100%' }}
				onClick={() => setOpenModal(true)}
			>
				Delete
			</Button>

			<Modal open={openModal} onClose={() => setOpenModal(false)}>
				<Box
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: '400px',
						bgcolor: 'background.paper',
						border: '2px solid #949494',
						boxShadow: 24,
						padding: 4,
					}}
				>
					<Typography variant="h6" textAlign="center">
						Delete Post
					</Typography>
					<Typography sx={{ padding: '8px' }}>
						Are you sure you want to delete this post?
					</Typography>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginTop: '10px',
						}}
					>
						<Button
							onClick={() => setOpenModal(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							onClick={handleDelete}
							color="error"
							disabled={isLoading}
						>
							Delete
						</Button>
					</Box>
				</Box>
			</Modal>
		</Box>
	);
};

export default DeletePost;
