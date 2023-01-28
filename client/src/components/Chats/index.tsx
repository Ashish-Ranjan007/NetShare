import {
	Avatar,
	Badge,
	Button,
	CircularProgress,
	Divider,
	List,
	ListItem,
	Modal,
	Typography,
} from '@mui/material';
import axios from 'axios';
import { Box } from '@mui/system';
import { Add } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import getTime from '../../utils/getTime';
import { ChatType } from '../../@types/responseType';
import GroupCreationForm from '../GroupCreationForm';
import getUnreadMessages from '../../utils/getUnreadMessages';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setChats, setCurrentChat } from '../../features/chats/chatsSlice';

const Chats = () => {
	const [page, setPage] = useState<number>(0);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [openModal, setOpenModal] = useState<boolean>(false);

	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);
	const chats = useAppSelector((state) => state.chats.chats);
	const currentChat = useAppSelector((state) => state.chats.currentChat);

	const fetchMore = async () => {
		try {
			const result = await axios.get<{
				success: boolean;
				data: { hasPrev: boolean; hasNext: boolean; chats: ChatType[] };
				error: string;
			}>(`${import.meta.env.VITE_API_BASE_URL}/api/chats/`, {
				headers: { Authorization: `Bearer ${auth.accessToken}` },
				params: { page: page },
			});

			dispatch(setChats(result.data.data.chats));
			setHasMore(result.data.data.hasNext);
			setPage((prev) => prev + 1);
		} catch (error) {
			console.log(error);
			setHasMore(false);
		}
	};

	const handleClick = (chat: ChatType) => {
		dispatch(setCurrentChat(chat));
	};

	useEffect(() => {
		if (chats.length === 0 && hasMore) {
			fetchMore();
		}
	}, [chats]);

	return (
		<Box sx={{ paddingX: '0' }}>
			<InfiniteScroll
				next={fetchMore}
				hasMore={hasMore}
				dataLength={chats.length}
				loader={
					<Box sx={{ textAlign: 'center' }}>
						<CircularProgress />
					</Box>
				}
				scrollableTarget="scrollable-chat-list"
			>
				<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
					<Button
						endIcon={<Add />}
						variant="outlined"
						onClick={() => setOpenModal(true)}
					>
						New Group
					</Button>
				</Box>
				<List>
					{chats.map((chat) => {
						let name: string;
						let displayPicture: string;

						if (chat.isGroup) {
							name = chat.name;
							displayPicture = chat.displayPicture;
						} else {
							if (chat.members[0].id === auth.id) {
								name = chat.members[1].username;
								displayPicture = chat.members[1].profilePic;
							} else {
								name = chat.members[0].username;
								displayPicture = chat.members[0].profilePic;
							}
						}

						return (
							<Box key={chat._id}>
								<Divider />
								<ListItem
									sx={{
										cursor: 'pointer',
										paddingX: '8px',
										transition: 'background 300ms ease',
										':hover': {
											background: 'rgba(0, 0, 0, 0.04)',
										},
										background:
											currentChat?._id === chat._id
												? 'rgba(0, 0, 0, 0.04)'
												: 'none',
									}}
									onClick={() => handleClick(chat)}
								>
									<Badge
										color="error"
										badgeContent={getUnreadMessages(
											chats,
											chat._id,
											auth.id
										)}
									>
										<Avatar
											src={displayPicture}
											sx={{ width: 32, height: 32 }}
										/>
									</Badge>
									<Box
										sx={{
											flex: 1,
											paddingLeft: '8px',
											paddingRight: '4px',
											width: '80%',
										}}
									>
										<Box
											sx={{
												width: '100%',
												display: 'flex',
												justifyContent: 'space-between',
												alignItems: 'center',
											}}
										>
											<Typography>{name}</Typography>
											{chat.lastMessage && (
												<Typography
													variant="body1"
													sx={{ fontSize: '10px' }}
												>
													{getTime(chat.updatedAt)}
												</Typography>
											)}
										</Box>
										{chat.isGroup ? (
											<Box>
												{chat.lastMessage ? (
													<Box>
														<Typography
															sx={{
																fontSize:
																	'12px',
																overflow:
																	'hidden',
																textOverflow:
																	'ellipsis',
																whiteSpace:
																	'nowrap',
															}}
														>
															{`${chat.lastMessage.sender.username}: ${chat.lastMessage.content}`}
														</Typography>
													</Box>
												) : null}
											</Box>
										) : (
											<Box>
												<Typography
													sx={{
														fontSize: '12px',
														overflow: 'hidden',
														textOverflow:
															'ellipsis',
														whiteSpace: 'nowrap',
													}}
												>
													{chat.lastMessage
														? chat.lastMessage
																.content
														: null}
												</Typography>
											</Box>
										)}
									</Box>
								</ListItem>
								<Divider />
							</Box>
						);
					})}
				</List>
			</InfiniteScroll>
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
					<GroupCreationForm setOpen={setOpenModal} />
				</Box>
			</Modal>
			{chats.length === 0 && (
				<Box>
					<Typography textAlign="center">
						You have no chats.
					</Typography>
				</Box>
			)}
		</Box>
	);
};

export default Chats;
