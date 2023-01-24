import {
	Backdrop,
	Box,
	Button,
	CircularProgress,
	Modal,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { DeleteForever } from '@mui/icons-material';

import { deleteGroup } from '../../../features/chats/chatsSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useDeleteGroupChatMutation } from '../../../features/chats/chatsApiSlice';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: '400px',
	bgcolor: 'background.paper',
	border: '2px solid #949494',
	boxShadow: 24,
	padding: 4,
};

const DeleteGroup = () => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);
	const [deleteDeleteGroup] = useDeleteGroupChatMutation();
	const chat = useAppSelector((state) => state.chats.currentChat);

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);

	const isAdmin = (userId: string): boolean => {
		if (!chat) {
			return false;
		}

		return chat.admins.find((admin) => admin.id === userId) ? true : false;
	};

	const handleDeleteGroup = async () => {
		if (!chat || !isAdmin(auth.id)) {
			return;
		}

		setOpenBackdrop(true);

		try {
			const returned = await deleteDeleteGroup(chat._id).unwrap();

			if (returned.success) {
				dispatch(deleteGroup({ chatId: chat._id }));
			}
		} catch (error) {
			console.log(error);
		} finally {
			setOpenBackdrop(false);
			setOpenModal(false);
		}
	};

	return (
		<Box sx={{ padding: '0px 16px 16px 16px' }}>
			<Button
				color="error"
				startIcon={<DeleteForever />}
				sx={{
					marginTop: '16px',
					width: '100%',
				}}
				variant="outlined"
				onClick={() => setOpenModal(true)}
				disabled={isAdmin(auth.id) ? false : true}
			>
				Delete Group
			</Button>
			<Modal open={openModal} onClose={() => setOpenModal(false)}>
				<Box sx={style}>
					<Typography variant="h6" textAlign="center">
						Delete Group
					</Typography>
					<Typography sx={{ paddingTop: '16px', fontSize: '14px' }}>
						This is an irreversible operation which will permanently
						delete all the messages belonging to the group.
					</Typography>
					<Typography variant="subtitle2" sx={{ paddingY: '16px' }}>
						Are you sure you want to delete this group?
					</Typography>

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Button onClick={() => setOpenModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleDeleteGroup} color="error">
							Delete Group
						</Button>
					</Box>
				</Box>
			</Modal>
			<Backdrop open={openBackdrop}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</Box>
	);
};

export default DeleteGroup;
