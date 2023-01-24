import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';

import { Chat } from '../models/Chat.model';
import { Message } from '../models/Message.model';

const onConnection = (io: Server, socket: Socket) => {
	console.log('connected to socket.io');

	// Join user to a dummy room when user comes online
	socket.on('setup', (userId: string) => {
		socket.join(userId);
		socket.emit('connected');
	});

	// Join user to a provided chat
	socket.on('join_chat', async (userId: string, chatId: string) => {
		// Check if chatId actually exist
		const chat = await Chat.findById(chatId);
		if (!chat) {
			socket.emit('chat_not_found');
			return;
		}

		// Check if user is a member of the chat
		const isMember = chat.members.find((member) => member.id === userId);
		if (!isMember) {
			socket.emit('not_authorized_to_join');
		}

		// Join chat
		socket.join(chatId);
		socket.emit('connected');
	});

	// Broadcast to connected room that the user is typing
	socket.on('typing', (chatId: string, username: string) => {
		socket.broadcast.in(chatId).emit('typing', chatId, username);
	});

	// Broadcast to connected room that the user has stopped typing
	socket.on('stop_typing', (chatId: string, username: string) => {
		socket.broadcast.in(chatId).emit('stop_typing', chatId, username);
	});

	// Emit a new message to all the users of a chat
	socket.on(
		'send_message',
		async (chatId: string, content: string, senderId: string) => {
			const chat = await Chat.findById(chatId);

			// Return if chat does not exist
			if (!chat) {
				return;
			}

			// Create a new message object
			const message = await Message.create({
				chat: new Types.ObjectId(chatId),
				content: content,
				sender: new Types.ObjectId(senderId),
			});
			// Populate message with sender and chat information
			await message.populate([
				{
					path: 'sender',
					select: '_id username profilePic',
				},
				{ path: 'chat', select: '_id' },
			]);

			// Increment totalMessage count
			chat.totalMessages += 1;
			// Update lastMessage field of chat
			chat.lastMessage = message._id;

			// Send message to currentUser(sender)
			socket.emit('new_message', message);
			// Send message to all the users connected to the provided chatId
			socket.in(chatId).emit('new_message', message);
			// Notify users that are offline
			chat.unreadMessages.forEach((member) => {
				if (!io.sockets.adapter.rooms.get(member.userId.toString())) {
					member.newMessages++;
				}
			});
			// Send message to all the users that are online but not connected to the provided chat
			/**
			 * 1. Get the roomId of the chat
			 * 2. For every user in the chat
			 * 3.	Get an array of all the rooms they are connected to
			 * 4	Check if that array has roomId of the chat
			 */
			const chatRoomId = io.sockets.adapter.rooms.get(chatId);
			chat.unreadMessages.forEach((member) => {
				const roomsMemberIsConnected = io.sockets.adapter.rooms.get(
					member.userId.toString()
				);

				if (chatRoomId && roomsMemberIsConnected) {
					// Check if it is connected to the room
					if (
						!chatRoomId.has(
							roomsMemberIsConnected.values().next().value
						)
					) {
						socket
							.in(member.userId.toString())
							.emit('new_message', message);
					}
				}
			});

			// save chat
			await chat.save();
		}
	);

	// Leave a room
	socket.on('leave_room', (roomId: string) => {
		socket.leave(roomId);
	});

	// Disconnect user from socket
	socket.off('setup', (chatId) => {
		// Leave chat
		socket.leave(chatId);
		socket.emit('disconnected');
	});
};

export { onConnection };
