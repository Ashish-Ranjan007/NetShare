import { Socket } from 'socket.io-client';
import { FormEvent, useEffect, useState } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

import { useAppSelector } from '../../../app/hooks';
import { InsertEmoticon, Send } from '@mui/icons-material';

const MessageBox = ({ socket }: { socket: Socket }) => {
	const [content, setContent] = useState<string>('');
	const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

	const auth = useAppSelector((state) => state.auth);
	const currentChat = useAppSelector((state) => state.chats.currentChat);

	const handleShowEmoji = () => {
		setShowEmojiPicker((prev) => !prev);
	};

	const handlePickEmoji = (emoji: EmojiClickData) => {
		setContent((prev) => prev + emoji.emoji);
	};

	// Send a new message
	const handleSubmit = async (e: FormEvent<HTMLInputElement>) => {
		e.preventDefault();
		if (content.length === 0 || !currentChat) {
			return;
		}

		socket.emit('send_message', currentChat._id, content, auth.id);
		setContent('');
		setShowEmojiPicker(false);
	};

	// Typing Indicator Debounce Function
	useEffect(() => {
		if (!currentChat) {
			return;
		}

		if (content.length === 0) {
			socket.emit('stop_typing', currentChat._id, auth.username);
			return;
		}

		socket.emit('typing', currentChat._id, auth.username);

		const timeoutId = setTimeout(() => {
			socket.emit('stop_typing', currentChat._id, auth.username);
		}, 3000);

		return () => clearTimeout(timeoutId);
	}, [content]);

	return (
		<Box component="form" onSubmit={handleSubmit}>
			<TextField
				size="small"
				sx={{
					width: '100%',
					position: 'absolute',
					bottom: '0px',
					paddingBottom: '8px',
				}}
				value={content}
				onChange={(e) => setContent(e.target.value)}
				autoComplete="off"
				InputProps={{
					startAdornment: (
						<IconButton onClick={handleShowEmoji}>
							<InsertEmoticon />
						</IconButton>
					),
					endAdornment: (
						<IconButton type="submit">
							<Send />
						</IconButton>
					),
					style: {
						paddingLeft: '4px',
						paddingRight: '4px',
					},
				}}
			/>
			{showEmojiPicker && (
				<Box>
					<EmojiPicker
						height="350px"
						onEmojiClick={handlePickEmoji}
					/>
				</Box>
			)}
		</Box>
	);
};

export default MessageBox;
