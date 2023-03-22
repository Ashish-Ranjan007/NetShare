import { apiSlice } from '../api/apiSlice';
import { ProfileReference } from '../../@types/responseType';

type CreatePostDataType = {
	contents: {
		public_id: string;
		secure_url: string;
	}[];
	caption: string;
};

export type PostType = {
	_id: string;
	createdBy: ProfileReference;
	createdAt: Date | null;
	likes: number;
	commentsCount: number;
	contents: {
		public_id: string;
		secure_url: string;
	}[];
	caption: string | null;
	isLiked: boolean;
	comments: CommentType[];
};

export type CommentType = {
	_id: string;
	postId: string;
	createdBy: ProfileReference;
	createdAt: Date;
	likes: number;
	content: string;
	repliesCount: number;
	updatedAt: Date | null;
	isLiked: boolean;
};

const postsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		createPost: builder.mutation<
			{ success: boolean; data: { postId: string }; error: string },
			CreatePostDataType
		>({
			query: (formData) => ({
				url: 'posts/create',
				method: 'POST',
				body: formData,
			}),
		}),
		getPostById: builder.query<
			{
				success: boolean;
				data: { post: PostType };
				error: string;
			},
			string
		>({
			query: (query) => ({
				url: '/posts/by-id',
				method: 'GET',
				params: { postId: query },
			}),
		}),
		likePost: builder.mutation<
			{ success: boolean; data: {}; error: string },
			string
		>({
			query: (postId) => ({
				url: 'posts/like',
				method: 'POST',
				body: { postId },
			}),
		}),
		unlikePost: builder.mutation<
			{ success: boolean; data: {}; error: string },
			string
		>({
			query: (postId) => ({
				url: '/posts/unlike',
				method: 'POST',
				body: { postId },
			}),
		}),
		addComment: builder.mutation<
			{ success: boolean; data: { comment: CommentType }; error: string },
			{ postId: string; content: string }
		>({
			query: (data) => ({
				url: '/posts/comment',
				method: 'POST',
				body: data,
			}),
		}),
		getComments: builder.query<
			{
				success: boolean;
				data: {
					hasPrev: boolean;
					hasNext: boolean;
					comments: CommentType[];
				};
				error: string;
			},
			{ postId: string; page: number }
		>({
			query: ({ postId, page }) => ({
				url: '/posts/comments',
				method: 'GET',
				params: { postId: postId, page: page },
			}),
		}),
		deletePost: builder.mutation<
			{ success: boolean; data: {}; error: string },
			{ postId: string }
		>({
			query: ({ postId }) => ({
				url: '/posts/delete',
				method: 'DELETE',
				body: { postId: postId },
			}),
		}),
	}),
});

export const {
	useCreatePostMutation,
	useGetPostByIdQuery,
	useLikePostMutation,
	useUnlikePostMutation,
	useAddCommentMutation,
	useLazyGetPostByIdQuery,
	useDeletePostMutation,
} = postsApiSlice;
