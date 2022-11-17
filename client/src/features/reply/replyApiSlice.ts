import { apiSlice } from '../api/apiSlice';
import { ProfileReference } from '../../@types/responseType';

export type ReplyType = {
	_id: string;
	commentId: string;
	repliedTo: {
		replyId: string | null;
		username: string | null;
	};
	createdBy: ProfileReference;
	createdAt: Date;
	likes: number;
	content: string;
	updatedAt: Date | null;
	isLiked: boolean;
};

export type ReplyResponseType = {
	data: {
		hasPrev: boolean;
		hasNext: boolean;
		replies: ReplyType[];
	};
};

const replyApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		likeReply: builder.mutation<
			{
				success: boolean;
				data: {};
				error: string;
			},
			string
		>({
			query: (replyId) => ({
				url: '/reply/like',
				method: 'POST',
				body: { replyId: replyId },
			}),
		}),
		unlikeReply: builder.mutation<
			{
				success: boolean;
				data: {};
				error: string;
			},
			string
		>({
			query: (replyId) => ({
				url: '/reply/unlike',
				method: 'POST',
				body: { replyId: replyId },
			}),
		}),
		replyToReply: builder.mutation<
			{ success: boolean; data: { reply: ReplyType }; error: string },
			{ commentId: string; replyId: string; content: string }
		>({
			query: ({ commentId, replyId, content }) => ({
				url: '/reply/reply',
				method: 'POST',
				body: {
					commentId: commentId,
					replyId: replyId,
					content: content,
				},
			}),
		}),
		updateReply: builder.mutation<
			{ success: boolean; data: { reply: ReplyType }; error: string },
			{ replyId: string; content: string }
		>({
			query: ({ replyId, content }) => ({
				url: '/reply/update',
				method: 'POST',
				body: {
					replyId: replyId,
					content: content,
				},
			}),
		}),
		deleteReply: builder.mutation<
			{
				success: boolean;
				data: {};
				error: string;
			},
			string
		>({
			query: (replyId) => ({
				url: '/reply/delete',
				method: 'DELETE',
				body: { replyId: replyId },
			}),
		}),
	}),
});

export const {
	useLikeReplyMutation,
	useUnlikeReplyMutation,
	useUpdateReplyMutation,
	useReplyToReplyMutation,
	useDeleteReplyMutation,
} = replyApiSlice;
