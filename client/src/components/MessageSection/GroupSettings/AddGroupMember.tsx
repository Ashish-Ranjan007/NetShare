import {
	Avatar,
	Backdrop,
	Box,
	Button,
	Checkbox,
	CircularProgress,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Modal,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { Add, PersonAdd } from '@mui/icons-material';

import { ProfileReference } from '../../../@types/responseType';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { addGroupMember } from '../../../features/chats/chatsSlice';
import { useAddGroupMemberMutation } from '../../../features/chats/chatsApiSlice';

const AddGroupMember = () => {
	const dispatch = useAppDispatch();
	const [postAddGroupMember] = useAddGroupMemberMutation();

	const auth = useAppSelector((state) => state.auth);
	const chat = useAppSelector((state) => state.chats.currentChat);

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [selectedUser, setSelectedUser] = useState<string | null>(null);

	const isAdmin = (userId: string): boolean => {
		if (!chat) {
			return false;
		}

		return chat.admins.find((admin) => admin.id === userId) ? true : false;
	};

	const getNonMemberFriends = (): ProfileReference[] => {
		if (!chat) {
			return [];
		}

		const result: ProfileReference[] = [];

		auth.friends.forEach((friend) => {
			const isFriendGroupMember = chat.members.find(
				(member) => member.id === friend.id
			);

			if (!isFriendGroupMember) {
				result.push(friend);
			}
		});

		return result;
	};

	const handleAddMember = async () => {
		if (!chat || !selectedUser) return;

		setOpenBackdrop(true);

		try {
			const returned = await postAddGroupMember({
				chatId: chat._id,
				userId: selectedUser,
			}).unwrap();
			console.log(returned);
			dispatch(addGroupMember(returned.data.groupChat));
		} catch (error) {
			console.log(error);
		} finally {
			setOpenBackdrop(false);
			setOpenModal(false);
		}
	};

	return (
		<Box>
			<Button
				endIcon={<PersonAdd />}
				onClick={() => setOpenModal(true)}
				disabled={isAdmin(auth.id) ? false : true}
			>
				Add Member
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
					<Typography textAlign="center" variant="h6">
						Add a Member
					</Typography>
					<Typography
						textAlign="center"
						variant="subtitle1"
						sx={{ fontSize: '14px' }}
					>
						Select 1 member to add to the group
					</Typography>
					<Box sx={{ marginTop: '16px' }}>
						<List>
							{getNonMemberFriends().length > 0 ? (
								getNonMemberFriends().map((friend) => {
									return (
										<ListItem
											key={friend.id}
											secondaryAction={
												<Checkbox
													edge="end"
													checked={
														friend.id ===
														selectedUser
															? true
															: false
													}
													onChange={() =>
														setSelectedUser(
															friend.id
														)
													}
												/>
											}
											sx={{
												cursor: 'pointer',
												transition: '300ms ease',
												':hover': {
													backgroundColor: '#eee',
												},
											}}
										>
											<ListItemAvatar>
												<Avatar
													src={friend.profilePic}
												/>
											</ListItemAvatar>
											<ListItemText
												primary={friend.username}
											/>
										</ListItem>
									);
								})
							) : (
								<Typography textAlign="center" color="gray">
									All of your friends are already in this
									group
								</Typography>
							)}
						</List>
						<Box
							sx={{
								marginTop: '16px',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Button onClick={() => setOpenModal(false)}>
								Cancel
							</Button>
							<Button
								endIcon={<Add />}
								disabled={selectedUser ? false : true}
								onClick={handleAddMember}
							>
								Add
							</Button>
						</Box>
					</Box>
				</Box>
			</Modal>
			<Backdrop
				sx={{
					color: '#fff',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={openBackdrop}
				onClick={() => setOpenBackdrop(false)}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
		</Box>
	);
};

export default AddGroupMember;
