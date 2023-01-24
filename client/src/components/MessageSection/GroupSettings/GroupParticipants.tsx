import {
	Avatar,
	Backdrop,
	Box,
	Button,
	CircularProgress,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Modal,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ProfileReference } from '../../../@types/responseType';

import {
	useAddAdminMutation,
	useRemoveAdminMutation,
	useRemoveMemberMutation,
} from '../../../features/chats/chatsApiSlice';
import {
	addAdmin,
	removeAdmin,
	removeMember,
} from '../../../features/chats/chatsSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';

const customScrollbar = {
	/* width */
	'::-webkit-scrollbar': {
		width: '8px',
	},

	/* Track */
	'::-webkit-scrollbar-track': {
		background: '#f1f1f1',
	},

	/* Handle */
	'::-webkit-scrollbar-thumb': {
		background: '#888',
	},

	/* Handle on hover */
	'::-webkit-scrollbar-thumb:hover': {
		background: '#555',
	},
};

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

const GroupParticipants = () => {
	const dispatch = useAppDispatch();
	const [postAddAdmin] = useAddAdminMutation();
	const [postRemoveAdmin] = useRemoveAdminMutation();
	const [postRemoveMember] = useRemoveMemberMutation();
	const chat = useAppSelector((state) => state.chats.currentChat);
	const auth = useAppSelector((state) => state.auth);

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
	const [selectedMember, setSelectedMember] =
		useState<ProfileReference | null>(null);

	const isAdmin = (userId: string): boolean => {
		if (!chat) {
			return false;
		}

		return chat.admins.find((admin) => admin.id === userId) ? true : false;
	};

	const handleAddAdmin = async () => {
		if (!chat || !selectedMember) {
			return;
		}

		setOpenBackdrop(true);

		try {
			if (isAdmin(selectedMember.id)) {
				return;
			} else {
				// Add Admin
				const returned = await postAddAdmin({
					chatId: chat._id,
					userId: selectedMember.id,
				}).unwrap();

				if (returned.success) {
					dispatch(
						addAdmin({ chatId: chat._id, admin: selectedMember })
					);
				}
			}
		} catch (error) {
			console.log(error);
		} finally {
			setOpenBackdrop(false);
			setOpenConfirmModal(false);
			setOpenModal(false);
		}
	};

	const handleRemove = async () => {
		if (!chat || !selectedMember) {
			return;
		}

		setOpenBackdrop(true);

		try {
			if (isAdmin(selectedMember.id)) {
				// Remove Admin
				const returned = await postRemoveAdmin({
					chatId: chat._id,
					adminId: selectedMember.id,
				}).unwrap();

				if (returned.success) {
					dispatch(
						removeAdmin({ chatId: chat._id, admin: selectedMember })
					);
				}
			} else {
				// Remove Member
				const returned = await postRemoveMember({
					chatId: chat._id,
					memberId: selectedMember.id,
				}).unwrap();

				if (returned.success) {
					dispatch(
						removeMember({
							chatId: chat._id,
							member: selectedMember,
						})
					);
				}
			}
		} catch (error) {
			console.log(error);
		} finally {
			setOpenBackdrop(false);
			setOpenConfirmModal(false);
			setOpenModal(false);
		}
	};

	return (
		<Box sx={{ marginTop: '16px' }}>
			<Typography
				textAlign="left"
				sx={{
					fontSize: '17px',
					fontWeight: '500',
					paddingLeft: '16px',
					marginTop: '16px',
				}}
			>{`${chat?.members.length} Participants`}</Typography>
			<List
				sx={{
					maxHeight: '400px',
					overflowY: 'auto',
					...customScrollbar,
				}}
			>
				{chat?.members.map((member) => (
					<ListItem
						key={member.id}
						sx={{
							cursor: 'pointer',
							transition: '300ms ease',
							':hover': {
								backgroundColor: '#e6e6e6',
							},
						}}
						secondaryAction={
							<Typography
								variant="subtitle2"
								color="primary"
								sx={{
									fontSize: '12px',
								}}
							>
								{isAdmin(member.id) && 'Admin'}
							</Typography>
						}
						onClick={() => {
							if (!isAdmin(auth.id)) {
								return;
							}

							setSelectedMember(member);
							setOpenModal(true);
						}}
					>
						<ListItemAvatar>
							<Avatar src={member.profilePic} />
						</ListItemAvatar>
						<ListItemText primary={member.username} />
					</ListItem>
				))}
			</List>
			<Modal open={openModal} onClose={() => setOpenModal(false)}>
				<Box sx={style}>
					<Typography variant="h6" textAlign="center">
						User Information
					</Typography>
					<Avatar
						src={selectedMember?.profilePic}
						sx={{
							width: '128px',
							height: '128px',
							margin: '32px auto 16px auto',
						}}
					/>
					<NavLink
						to={`/profile/${selectedMember?.username}/${selectedMember?.id}`}
					>
						<Typography
							textAlign="center"
							sx={{ textDecoration: 'underline' }}
							color="primary"
						>
							{selectedMember?.username}
						</Typography>
					</NavLink>

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginTop: '16px',
						}}
					>
						{isAdmin(selectedMember?.id || '') ? (
							<>
								<Button onClick={() => setOpenModal(false)}>
									Cancel
								</Button>
								<Button
									color="error"
									onClick={() => setOpenConfirmModal(true)}
								>
									Dismiss as Admin
								</Button>
							</>
						) : (
							<>
								<Button onClick={handleAddAdmin}>
									Make Admin
								</Button>
								<Button
									color="error"
									onClick={() => setOpenConfirmModal(true)}
								>
									Remove Member
								</Button>
							</>
						)}
					</Box>
				</Box>
			</Modal>
			<Modal
				open={openConfirmModal}
				onClose={() => setOpenConfirmModal(false)}
			>
				<Box sx={{ ...style, width: { xs: '400px', sm: '500px' } }}>
					<Typography variant="h6" textAlign="center">
						{isAdmin(selectedMember?.id || '')
							? 'Dismiss as Group Admin'
							: 'Remove User form Group'}
					</Typography>
					<Typography sx={{ marginY: '16px' }}>
						{isAdmin(selectedMember?.id || '')
							? 'Are you sure you want to dismiss this user as an admin ?'
							: 'Are you sure you want to remove this user from the group ?'}
					</Typography>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-end',
						}}
					>
						<Button color="error" onClick={handleRemove}>
							Remove
						</Button>
						<Button onClick={() => setOpenConfirmModal(false)}>
							Cancel
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

export default GroupParticipants;
