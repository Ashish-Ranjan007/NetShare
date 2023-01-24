import { ChatType } from '../../@types/responseType';
import { apiSlice } from '../api/apiSlice';

const chatsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		createOrFetchChat: builder.mutation<
			{ success: boolean; data: { chat: ChatType }; error: string },
			string
		>({
			query: (targetId) => ({
				url: '/chats/create-chat',
				method: 'POST',
				body: { targetId: targetId },
			}),
		}),
		createGroupChat: builder.mutation<
			{ success: boolean; data: { groupChat: ChatType }; error: string },
			{ name: string; userIds: string[]; displayPictureUrl: string }
		>({
			query: (formdata) => ({
				url: '/chats/create-group-chat',
				method: 'POST',
				body: formdata,
			}),
		}),
		addGroupMember: builder.mutation<
			{ success: boolean; data: { groupChat: ChatType }; error: string },
			{ chatId: string; userId: string }
		>({
			query: ({ chatId, userId }) => ({
				url: '/chats/add-member',
				method: 'POST',
				body: { chatId, userId },
			}),
		}),
		setDisplayPicture: builder.mutation<
			{ success: boolean; data: { groupChat: ChatType }; error: string },
			{ chatId: string; displayPictureUrl: string }
		>({
			query: ({ chatId, displayPictureUrl }) => ({
				url: '/chats/set-display-picture',
				method: 'POST',
				body: { chatId, displayPictureUrl },
			}),
		}),
		renameGroup: builder.mutation<
			{ success: boolean; data: { groupChat: ChatType }; error: string },
			{ chatId: string; newName: string }
		>({
			query: ({ chatId, newName }) => ({
				url: '/chats/rename-group',
				method: 'POST',
				body: { chatId, newName },
			}),
		}),
		removeMember: builder.mutation<
			{ success: boolean; data: { groupChat: ChatType }; error: string },
			{ chatId: string; memberId: string }
		>({
			query: ({ chatId, memberId }) => ({
				url: '/chats/remove-member',
				method: 'POST',
				body: { chatId, memberId },
			}),
		}),
		addAdmin: builder.mutation<
			{ success: boolean; data: { groupChat: ChatType }; error: string },
			{ chatId: string; userId: string }
		>({
			query: ({ chatId, userId }) => ({
				url: '/chats/add-admin',
				method: 'POST',
				body: { chatId, userId },
			}),
		}),
		removeAdmin: builder.mutation<
			{ success: boolean; data: { groupChat: ChatType }; error: string },
			{ chatId: string; adminId: string }
		>({
			query: ({ chatId, adminId }) => ({
				url: '/chats/remove-admin',
				method: 'POST',
				body: { chatId, adminId },
			}),
		}),
		resetUnreadMessages: builder.mutation<
			{ success: boolean; data: {}; error: string },
			string
		>({
			query: (chatId) => ({
				url: '/chats/seen-all-messages',
				method: 'POST',
				body: { chatId },
			}),
		}),
		deleteGroupChat: builder.mutation<
			{ success: boolean; data: {}; error: string },
			string
		>({
			query: (chatId) => ({
				url: '/chats/delete-group-chat',
				method: 'DELETE',
				body: { chatId },
			}),
		}),
		deleteChat: builder.mutation<
			{ success: boolean; data: {}; error: string },
			string
		>({
			query: (chatId) => ({
				url: '/chats/delete-chat',
				method: 'DELETE',
				body: { chatId },
			}),
		}),
	}),
});

export const {
	useCreateOrFetchChatMutation,
	useCreateGroupChatMutation,
	useAddGroupMemberMutation,
	useSetDisplayPictureMutation,
	useRenameGroupMutation,
	useAddAdminMutation,
	useRemoveMemberMutation,
	useRemoveAdminMutation,
	useDeleteGroupChatMutation,
	useDeleteChatMutation,
	useResetUnreadMessagesMutation,
} = chatsApiSlice;
