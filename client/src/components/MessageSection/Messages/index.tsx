import {
	Box,
	CircularProgress,
	List,
	ListItem,
	Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { NavLink } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { ChatType, MessageType } from '../../../@types/responseType';
import { clearMessages, setMessages } from '../../../features/chats/chatsSlice';

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

const getTime = (date: Date): string => {
	const newDate = new Date(date);

	return `${newDate.getHours()}:${newDate.getMinutes()}`;
};

const months = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

const Messages = ({ socket }: { socket: Socket }) => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);
	const messages = useAppSelector((state) => state.chats.messages);
	const currentChat = useAppSelector((state) => state.chats.currentChat);

	const page = useRef<number>(0);
	const hasMore = useRef<boolean>(true);
	const currentChatRef = useRef<ChatType | null>(null);

	// Reset states when currentChat changes
	useEffect(() => {
		if (currentChat && currentChat !== currentChatRef.current) {
			page.current = 0;
			hasMore.current = true;
			dispatch(clearMessages());
		}
	}, [currentChat]);

	// Call fetchMore when currentChat changes
	useEffect(() => {
		if (currentChat && currentChat !== currentChatRef.current) {
			fetchMore();
			currentChatRef.current = currentChat;
		}
	}, [currentChat, page, hasMore]);

	// Fetch messages
	const fetchMore = async () => {
		if (!currentChat) {
			return;
		}

		try {
			const result = await axios.get<{
				success: boolean;
				data: {
					hasPrev: boolean;
					hasNext: boolean;
					messages: MessageType[];
				};
				error: string;
			}>(`${import.meta.env.VITE_API_BASE_URL}/api/messages/`, {
				headers: { Authorization: `Bearer ${auth.accessToken}` },
				params: { chatId: currentChat._id, page: page.current },
			});

			if (result.data.success) {
				console.log(result);
				dispatch(setMessages(result.data.data.messages));
				hasMore.current = result.data.data.hasNext;
				page.current += 1;
			}
		} catch (error) {
			console.log(error);
			hasMore.current = false;
		}
	};

	const displayUserName = (message: MessageType, index: number): boolean => {
		// If currentChat is not group return false
		if (!currentChat || !currentChat.isGroup) {
			return false;
		}

		// If currentChat is group and sender of the message is current user return false
		if (message.sender._id === auth._id) {
			return false;
		}

		// If sender of previous message is same as current message return false
		if (
			messages[index + 1] &&
			message.sender._id === messages[index + 1].sender._id
		) {
			return false;
		}

		return true;
	};

	// If previous message is sent by the a different user than the current apply a margin of 8px
	const applyMargin = (index: number): boolean => {
		if (!messages[index + 1]) {
			return false;
		}

		if (messages[index + 1].sender._id === messages[index].sender._id) {
			return false;
		}

		return true;
	};

	// Insert Date between different days
	const insertDate = (index: number, message: MessageType): string | null => {
		if (!messages[index + 1]) return null;

		const currDate = new Date(message.createdAt);
		const prevDate = new Date(messages[index + 1].createdAt);

		if (currDate.getDate() !== prevDate.getDate()) {
			return `${currDate.getDate()} ${
				months[currDate.getMonth()]
			} ${currDate.getFullYear()}`;
		}

		return null;
	};

	return (
		<List
			sx={{
				height: {
					xs: 'calc(100% - 56px - 48px)',
					sm: currentChat?.isGroup
						? 'calc(100% - 70px - 48px)'
						: 'calc(100% - 58px - 48px)',
				},
				overflow: 'auto',
				display: 'flex', // To put the scrollbar at the bottom
				flexDirection: 'column-reverse', // To put the scrollbar at the bottom
				...customScrollbar,
			}}
			className="message-container-bg"
			id="message-container-bg"
		>
			<InfiniteScroll
				next={fetchMore}
				hasMore={hasMore.current ? true : false}
				dataLength={messages.length}
				loader={
					<Box sx={{ textAlign: 'center' }}>
						<CircularProgress />
					</Box>
				}
				scrollableTarget="message-container-bg"
				style={{
					// To put the scrollbar at the bottom
					display: 'flex',
					flexDirection: 'column-reverse',
				}}
				inverse={true} // To start scrolling from bottom
			>
				{currentChat &&
					messages.map((message, index) => (
						<div key={message._id}>
							<Typography
								sx={{
									fontSize: '10px',
									textAlign: 'center',
									padding: '5px 16px',
									background: '#7b7b7b',
									borderRadius: '16px',
									marginX: 'auto',
									display: insertDate(index, message)
										? 'inline-block'
										: 'none',
									color: 'white',
								}}
								component="span"
							>
								{insertDate(index, message)}
							</Typography>
							<ListItem
								key={message._id}
								sx={{
									paddingY: '1px',
									marginTop: applyMargin(index) ? '8px' : '',
								}}
							>
								<Box
									sx={{
										minWidth: '100px',
										maxWidth: '80%',
										background: '#e2e2e2',
										padding: '4px 16px 4px 8px',
										borderRadius: '15px',
										marginLeft:
											message.sender._id === auth._id
												? 'auto'
												: '',
									}}
								>
									<NavLink
										to={`/profile/${message.sender.username}/${message.sender._id}`}
										style={{
											color: '#1976d2',
											fontSize: '14px',
											display: displayUserName(
												message,
												index
											)
												? 'block'
												: 'none',
										}}
									>
										{message.sender.username}
									</NavLink>
									<Typography
										sx={{
											fontSize: '14px',
										}}
									>
										{message.content}
									</Typography>
									<Typography
										sx={{
											fontSize: '10px',
										}}
										textAlign="right"
									>
										{getTime(message.createdAt)}
									</Typography>
								</Box>
							</ListItem>
						</div>
					))}
			</InfiniteScroll>
		</List>
	);
};

export default Messages;
