import {
	Backdrop,
	Button,
	CircularProgress,
	Modal,
	Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { ExitToAppSharp } from '@mui/icons-material';

import { deleteGroup } from '../../../features/chats/chatsSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useRemoveMemberMutation } from '../../../features/chats/chatsApiSlice';

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

const ExistGroup = () => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);

	const dispatch = useAppDispatch();
	const [postRemoveMember] = useRemoveMemberMutation();
	const auth = useAppSelector((state) => state.auth);
	const chat = useAppSelector((state) => state.chats.currentChat);

	const isAdmin = (userId: string): boolean => {
		if (!chat) {
			return false;
		}

		return chat.admins.find((admin) => admin.id === userId) ? true : false;
	};

	const isMember = (userId: string): boolean => {
		if (!chat) {
			return false;
		}

		return chat.members.find((member) => member.id === userId)
			? true
			: false;
	};

	const handleExitGroup = async () => {
		if (!chat || !isMember(auth.id)) {
			return;
		}

		setOpenBackdrop(true);

		try {
			const returned = await postRemoveMember({
				chatId: chat._id,
				memberId: auth.id,
			}).unwrap();

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
		<Box sx={{ padding: '8px 16px' }}>
			<Button
				color="error"
				startIcon={<ExitToAppSharp />}
				sx={{
					marginTop: '16px',
					width: '100%',
				}}
				variant="outlined"
				onClick={() => setOpenModal(true)}
				disabled={isAdmin(auth.id) ? false : true}
			>
				Exit Group
			</Button>
			<Modal open={openModal} onClose={() => setOpenModal(false)}>
				<Box sx={style}>
					<Typography variant="h6" textAlign="center">
						Exit Group
					</Typography>
					<Typography sx={{ marginY: '16px' }}>
						Are you sure that you want to leave this group ?
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
						<Button onClick={handleExitGroup} color="error">
							Exit Group
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

export default ExistGroup;
