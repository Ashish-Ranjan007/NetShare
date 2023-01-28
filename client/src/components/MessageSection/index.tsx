import { Box } from '@mui/system';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import Messages from './Messages';
import MessageBox from './MessageBox';
import ChatHeader from './ChatHeader';
import {
	addMessage,
	incrementUnreadMessage,
	resetUnreadMessage,
	updateLastMessage,
} from '../../features/chats/chatsSlice';
import { MessageType } from '../../@types/responseType';
import getUnreadMessages from '../../utils/getUnreadMessages';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useResetUnreadMessagesMutation } from '../../features/chats/chatsApiSlice';
import { Typography } from '@mui/material';

let socket: Socket;
const SERVER_ENDPOINT = import.meta.env.VITE_API_BASE_URL;

const MessageSection = () => {
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);
	const [postResetUnreadMessages] = useResetUnreadMessagesMutation();
	const currentChat = useAppSelector((state) => state.chats.currentChat);

	const [typingUser, setTypingUser] = useState<string | null>(null);
	const [socketConnected, setSocketConnected] = useState<boolean>(false);

	// Join the currentChat room everytime currentChat changes
	useEffect(() => {
		socket = io(SERVER_ENDPOINT);

		socket.emit('setup', auth.id);

		if (currentChat) {
			socket.emit('join_chat', auth.id, currentChat._id);
			socket.on('connected', () => {
				setSocketConnected(true);
			});
		}

		return () => {
			socket.emit('leave_room', auth.id);
			if (currentChat) {
				socket.emit('leave_room', currentChat._id);
			}
		};
	}, [currentChat]);

	// Recieve messages
	useEffect(() => {
		socket.on('new_message', (message: MessageType) => {
			// Update last message
			dispatch(
				updateLastMessage({
					chatId: message.chat._id,
					lastMessage: message,
				})
			);

			// If currentChat is not null and is same as message.chat._id
			if (currentChat && currentChat._id === message.chat._id) {
				// Add a new message
				dispatch(addMessage(message));
			} else {
				// Increment notifications by 1
				dispatch(
					incrementUnreadMessage({
						chatId: message.chat._id,
						authId: auth.id,
					})
				);
			}
		});

		return () => {
			socket.off('new_message');
		};
	});

	// Clear all notifications of currentChat if there is any
	useEffect(() => {
		const func = async () => {
			if (!currentChat) {
				return;
			}

			if (
				getUnreadMessages([currentChat], currentChat._id, auth.id) === 0
			) {
				return;
			}

			const hasUnreadMessages = await postResetUnreadMessages(
				currentChat._id
			).unwrap();
			if (hasUnreadMessages.success) {
				dispatch(
					resetUnreadMessage({
						chatId: currentChat._id,
						authId: auth.id,
					})
				);
			}
		};

		func();
	}, [currentChat]);

	// Typing Indicator socket event handler
	useEffect(() => {
		socket.on('typing', (chatId: string, username: string) => {
			setTypingUser(username);
		});

		socket.on('stop_typing', (chatId: string, username: string) => {
			setTypingUser(null);
		});
	});

	return (
		<Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
			{currentChat && (
				<>
					<ChatHeader typingUser={typingUser} />
					<Messages socket={socket} />
					<MessageBox socket={socket} />
				</>
			)}
			{!currentChat && (
				<Typography
					variant="h6"
					textAlign="center"
					sx={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
					}}
				>
					No chat is currently selected
				</Typography>
			)}
		</Box>
	);
};

export default MessageSection;
