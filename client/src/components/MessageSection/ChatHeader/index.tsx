import {
	Avatar,
	Backdrop,
	Button,
	CircularProgress,
	Drawer,
	IconButton,
	Menu,
	MenuItem,
	Modal,
	Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { MoreVert } from '@mui/icons-material';
import { IoMdArrowRoundBack } from 'react-icons/io';

import { NavLink } from 'react-router-dom';
import GroupSettings from '../GroupSettings';
import { ProfileReference } from '../../../@types/responseType';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useDeleteChatMutation } from '../../../features/chats/chatsApiSlice';
import { deleteChat, setCurrentChat } from '../../../features/chats/chatsSlice';

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

const ChatHeader = ({ typingUser }: { typingUser: string | null }) => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);
	const [deleteDeleteChat] = useDeleteChatMutation();
	const currentChat = useAppSelector((state) => state.chats.currentChat);

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openDrawer, setOpenDrawer] = useState<boolean>(false);
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const openMenu = Boolean(anchorEl);

	const getDisplayPicture = (): string => {
		if (!currentChat) return '';

		if (currentChat.isGroup) {
			return currentChat.displayPicture;
		}

		let result: string;

		if (currentChat.members[0].id === auth.id) {
			result = currentChat.members[1].profilePic;
		} else {
			result = currentChat.members[0].profilePic;
		}

		return result;
	};

	const getChatName = (): string => {
		if (!currentChat) return '';

		if (currentChat.isGroup) {
			return currentChat.name;
		}

		let result: string;
		if (currentChat.members[0].id === auth.id) {
			result = currentChat.members[1].username;
		} else {
			result = currentChat.members[0].username;
		}

		return result;
	};

	const getMembers = (): string[] => {
		if (!currentChat) {
			return [];
		}
		if (!currentChat.isGroup) {
			return [];
		}

		const result: string[] = [];
		currentChat.members.map((member) => {
			if (result.length < 2) {
				result.push(member.username);
			}
		});

		return result;
	};

	const getFriend = (): ProfileReference | null => {
		if (!currentChat) {
			return null;
		}

		let result: ProfileReference;
		if (currentChat.members[0].id === auth.id) {
			result = currentChat.members[1];
		} else {
			result = currentChat.members[0];
		}

		return result;
	};

	const handleBack = () => {
		dispatch(setCurrentChat(null));
	};

	const handleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleDeleteChat = async () => {
		if (!currentChat) {
			return;
		}

		setOpenBackdrop(true);

		try {
			const returned = await deleteDeleteChat(currentChat._id).unwrap();

			if (returned.success) {
				dispatch(deleteChat({ chatId: currentChat._id }));
			}
		} catch (error) {
			console.log(error);
		} finally {
			setOpenBackdrop(false);
			setAnchorEl(null);
		}
	};

	return (
		<Box sx={{ width: '100%' }}>
			{currentChat && (
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						background: '#DDDDDD',
						padding: '8px 8px',
						boxShadow: 3,
					}}
				>
					<IconButton
						onClick={handleBack}
						sx={{
							display: { xs: 'block', lg: 'none' },
							padding: '2px 2px',
							paddingTop: '5px',
						}}
					>
						<IoMdArrowRoundBack />
					</IconButton>
					<Avatar src={getDisplayPicture()} />
					<Box sx={{ paddingLeft: '16px' }}>
						<Typography
							variant="body1"
							sx={{
								fontSize: '18px',
								fontWeight: '500',
								cursor: 'pointer',
								display: currentChat.isGroup ? 'block' : 'none',
							}}
							onClick={() => setOpenDrawer(true)}
						>
							{getChatName()}
						</Typography>
						<NavLink
							to={`/profile/${getFriend()?.username}/${
								getFriend()?.id
							}`}
							style={{
								fontSize: '18px',
								fontWeight: '500',
								cursor: 'pointer',
								color: 'inherit',
								display: currentChat.isGroup ? 'none' : 'block',
							}}
						>
							{getChatName()}
						</NavLink>
						<Box sx={{ display: typingUser ? 'none' : 'block' }}>
							{getMembers().map((member, index) => (
								<Typography
									component="span"
									variant="subtitle1"
									sx={{
										fontSize: '13px',
										paddingRight: '2px',
										display: { xs: 'none', sm: 'inline' },
									}}
									key={member}
								>
									{index < 2 ? `${member}, ` : member}
								</Typography>
							))}
							{currentChat.members.length > 2 && (
								<Typography
									component="span"
									variant="subtitle1"
									sx={{
										fontSize: '13px',
										paddingRight: '2px',
										textOverflow: 'ellipsis',
										display: { xs: 'none', sm: 'inline' },
									}}
								>{`and ${
									currentChat.members.length - 2
								} more`}</Typography>
							)}
						</Box>
						<Typography
							sx={{
								display: typingUser ? 'block' : 'none',
								fontSize: '10px',
							}}
						>{`${typingUser} is typing...`}</Typography>
					</Box>
					<Box
						sx={{
							marginLeft: 'auto',
							display: currentChat.isGroup ? 'none' : 'block',
						}}
					>
						<IconButton onClick={handleMenu}>
							<MoreVert />
						</IconButton>
						<Menu
							anchorEl={anchorEl}
							open={openMenu}
							onClose={() => setAnchorEl(null)}
						>
							<MenuItem onClick={() => setOpenModal(true)}>
								Delete Chat
							</MenuItem>
						</Menu>
					</Box>
				</Box>
			)}
			{currentChat && currentChat.isGroup && (
				<Drawer
					anchor="right"
					open={openDrawer}
					onClose={() => setOpenDrawer(false)}
				>
					<GroupSettings chat={currentChat} onClose={setOpenDrawer} />
				</Drawer>
			)}
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
						<Button onClick={handleDeleteChat} color="error">
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

export default ChatHeader;
