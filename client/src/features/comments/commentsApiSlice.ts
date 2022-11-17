import { apiSlice } from '../api/apiSlice';
import { CommentType } from '../post/postApiSlice';
import { ReplyType } from '../reply/replyApiSlice';

const commentsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		likeComment: builder.mutation<
			{
				success: boolean;
				data: {};
				error: string;
			},
			string
		>({
			query: (commentId) => ({
				url: '/comments/like',
				method: 'POST',
				body: { commentId: commentId },
			}),
		}),
		unlikeComment: builder.mutation<
			{
				success: boolean;
				data: {};
				error: string;
			},
			string
		>({
			query: (commentId) => ({
				url: '/comments/unlike',
				method: 'POST',
				body: { commentId: commentId },
			}),
		}),
		reply: builder.mutation<
			{
				success: boolean;
				data: { reply: ReplyType };
				error: string;
			},
			{ commentId: string; content: string }
		>({
			query: ({ commentId, content }) => ({
				url: 'comments/reply',
				method: 'POST',
				body: { commentId: commentId, content: content },
			}),
		}),
		updateComment: builder.mutation<
			{
				success: boolean;
				data: { comment: CommentType };
				error: string;
			},
			{ commentId: string; content: string }
		>({
			query: ({ commentId, content }) => ({
				url: 'comments/update',
				method: 'POST',
				body: { commentId: commentId, content: content },
			}),
		}),
		deleteComment: builder.mutation<
			{
				success: boolean;
				data: {};
				error: string;
			},
			string
		>({
			query: (commentId) => ({
				url: '/comments/delete',
				method: 'DELETE',
				body: { commentId: commentId },
			}),
		}),
		getReplies: builder.query<
			{
				success: boolean;
				data: {
					hasPrev: boolean;
					hasNext: boolean;
					comments: CommentType[];
				};
				error: string;
			},
			{ commentId: string; page: number }
		>({
			query: ({ commentId, page }) => ({
				url: 'comments/replies',
				methdod: 'GET',
				params: { commentId: commentId, page: page },
			}),
		}),
	}),
});

export const {
	useLikeCommentMutation,
	useUnlikeCommentMutation,
	useUpdateCommentMutation,
	useDeleteCommentMutation,
	useReplyMutation,
	useGetRepliesQuery,
} = commentsApiSlice;
