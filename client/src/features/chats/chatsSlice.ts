import {
	ChatType,
	MessageType,
	ProfileReference,
} from '../../@types/responseType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: {
	chats: ChatType[];
	currentChat: ChatType | null;
	messages: MessageType[];
} = {
	chats: [],
	currentChat: null,
	messages: [],
};

export const chatsSlice = createSlice({
	name: 'chats',
	initialState: initialState,
	reducers: {
		setChats: (state, action: PayloadAction<ChatType[]>) => {
			state.chats = [...state.chats, ...action.payload];
		},
		setCurrentChat: (state, action: PayloadAction<ChatType | null>) => {
			state.currentChat = action.payload;
		},
		addChat: (state, action: PayloadAction<ChatType>) => {
			state.chats = [action.payload, ...state.chats];
		},
		addGroupMember: (state, action: PayloadAction<ChatType>) => {
			state.chats = state.chats.map((chat) => {
				if (chat._id === action.payload._id) {
					return {
						...chat,
						members: action.payload.members,
					};
				}

				return chat;
			});

			if (state.currentChat) {
				state.currentChat.members = action.payload.members;
			}
		},
		setDisplayPicture: (
			state,
			action: PayloadAction<{ chatId: string; displayPictureUrl: string }>
		) => {
			state.chats = state.chats.map((chat) => {
				if (chat._id === action.payload.chatId) {
					return {
						...chat,
						displayPicture: action.payload.displayPictureUrl,
					};
				}

				return chat;
			});

			if (state.currentChat) {
				state.currentChat.displayPicture =
					action.payload.displayPictureUrl;
			}
		},
		renameGroup: (
			state,
			action: PayloadAction<{ chatId: string; newName: string }>
		) => {
			state.chats = state.chats.map((chat) => {
				if (chat._id === action.payload.chatId) {
					return {
						...chat,
						name: action.payload.newName,
					};
				}

				return chat;
			});

			if (state.currentChat) {
				state.currentChat.name = action.payload.newName;
			}
		},
		addAdmin: (
			state,
			action: PayloadAction<{ chatId: string; admin: ProfileReference }>
		) => {
			state.chats = state.chats.map((chat) => {
				if (chat._id === action.payload.chatId) {
					return {
						...chat,
						admins: [...chat.admins, action.payload.admin],
					};
				}

				return chat;
			});

			if (state.currentChat) {
				state.currentChat.admins = [
					...state.currentChat.admins,
					action.payload.admin,
				];
			}
		},
		removeAdmin: (
			state,
			action: PayloadAction<{ chatId: string; admin: ProfileReference }>
		) => {
			state.chats = state.chats.map((chat) => {
				if (chat._id === action.payload.chatId) {
					chat.admins = chat.admins.filter(
						(admin) => admin._id !== action.payload.admin._id
					);
				}

				return chat;
			});

			if (state.currentChat) {
				state.currentChat.admins = state.currentChat.admins.filter(
					(admin) => admin._id !== action.payload.admin._id
				);
			}
		},
		removeMember: (
			state,
			action: PayloadAction<{ chatId: string; member: ProfileReference }>
		) => {
			state.chats = state.chats.map((chat) => {
				if (chat._id === action.payload.chatId) {
					chat.members = chat.members.filter(
						(member) => member._id !== action.payload.member._id
					);
				}

				return chat;
			});

			if (state.currentChat) {
				state.currentChat.members = state.currentChat.members.filter(
					(member) => member._id !== action.payload.member._id
				);
			}
		},
		deleteGroup: (state, action: PayloadAction<{ chatId: string }>) => {
			state.chats = state.chats.filter(
				(chat) => chat._id !== action.payload.chatId
			);

			state.currentChat = null;
		},
		deleteChat: (state, action: PayloadAction<{ chatId: string }>) => {
			state.chats = state.chats.filter(
				(chat) => chat._id !== action.payload.chatId
			);

			state.currentChat = null;
		},
		setMessages: (state, action: PayloadAction<MessageType[]>) => {
			state.messages = [...state.messages, ...action.payload];
		},
		addMessage: (state, action: PayloadAction<MessageType>) => {
			console.log('addMessage', action.payload);
			state.messages = [action.payload, ...state.messages];
		},
		clearMessages: (state) => {
			state.messages = [];
		},
		resetUnreadMessage: (
			state,
			action: PayloadAction<{ chatId: string; authId: string }>
		) => {
			state.chats = state.chats.map((chat) => {
				if (chat._id !== action.payload.chatId) {
					return chat;
				}

				chat.unreadMessages = chat.unreadMessages.map(
					(unreadMessage) => {
						if (unreadMessage.userId === action.payload.authId) {
							unreadMessage.newMessages = 0;
						}
						return unreadMessage;
					}
				);

				return chat;
			});

			// Reset currentMessage
			if (state.currentChat) {
				state.currentChat.unreadMessages =
					state.currentChat.unreadMessages.map((unreadMessage) => {
						if (unreadMessage.userId === action.payload.authId) {
							unreadMessage.newMessages = 0;
						}
						return unreadMessage;
					});
			}
		},
		updateLastMessage: (
			state,
			action: PayloadAction<{ chatId: string; lastMessage: MessageType }>
		) => {
			console.log('Update last message');
			state.chats = state.chats.map((chat) => {
				if (chat._id !== action.payload.chatId) {
					return chat;
				}

				return {
					...chat,
					lastMessage: action.payload.lastMessage,
				};
			});
		},
		incrementUnreadMessage: (
			state,
			action: PayloadAction<{ chatId: string; authId: string }>
		) => {
			state.chats = state.chats.map((chat) => {
				if (chat._id !== action.payload.chatId) {
					return chat;
				}

				chat.unreadMessages = chat.unreadMessages.map((message) => {
					if (message.userId === action.payload.authId) {
						return {
							...message,
							newMessages: message.newMessages + 1,
						};
					}

					return message;
				});

				return chat;
			});
		},
	},
});

// export action creators
export const {
	setChats,
	setCurrentChat,
	addChat,
	addGroupMember,
	setDisplayPicture,
	renameGroup,
	addAdmin,
	removeAdmin,
	removeMember,
	deleteGroup,
	deleteChat,
	addMessage,
	setMessages,
	clearMessages,
	resetUnreadMessage,
	updateLastMessage,
	incrementUnreadMessage,
} = chatsSlice.actions;

// export reducers
export default chatsSlice.reducer;
