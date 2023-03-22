import {
	Backdrop,
	Box,
	Button,
	CircularProgress,
	Modal,
	TextField,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { DriveFileRenameOutline } from '@mui/icons-material';

import { renameGroup } from '../../../features/chats/chatsSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useRenameGroupMutation } from '../../../features/chats/chatsApiSlice';

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

const RenameGroup = () => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);
	const [postRenameGroup] = useRenameGroupMutation();
	const chat = useAppSelector((state) => state.chats.currentChat);

	const [name, setName] = useState<string>('');
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openBackDrop, setOpenBackdrop] = useState<boolean>(false);

	const isAdmin = (userId: string): boolean => {
		if (!chat) {
			return false;
		}

		return chat.admins.find((admin) => admin._id === userId) ? true : false;
	};

	const handleSubmit = async () => {
		if (!chat || name.length === 0) {
			setOpenModal(false);
			return;
		}

		try {
			setOpenBackdrop(true);
			const returned = await postRenameGroup({
				chatId: chat._id,
				newName: name,
			}).unwrap();

			if (returned.success) {
				dispatch(renameGroup({ chatId: chat._id, newName: name }));
			}
		} catch (error) {
			console.log(error);
		} finally {
			setOpenModal(false);
			setOpenBackdrop(false);
		}
	};

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexWrap: 'wrap',
				marginTop: '16px',
				gap: '8px',
			}}
		>
			<Typography variant="h6" textAlign="center">
				{chat?.name}
			</Typography>
			<DriveFileRenameOutline
				color={isAdmin(auth._id) ? 'primary' : 'disabled'}
				sx={{ cursor: 'pointer' }}
				onClick={() => {
					if (!isAdmin(auth._id)) {
						return;
					}
					setOpenModal(true);
				}}
			/>

			<Modal open={openModal} onClose={() => setOpenModal(false)}>
				<Box sx={style}>
					<Typography variant="h6" textAlign="center">
						Rename Group Chat
					</Typography>
					<TextField
						size="small"
						variant="outlined"
						label="Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						sx={{ marginTop: '16px', marginBlock: '32px' }}
					/>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
						onClick={handleSubmit}
					>
						<Button onClick={() => setOpenModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleSubmit}>Submit</Button>
					</Box>
				</Box>
			</Modal>
			<Backdrop open={openBackDrop}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</Box>
	);
};

export default RenameGroup;
