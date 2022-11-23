import { CommentType } from './postApiSlice';
import { ProfileReference } from '../../@types/responseType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PostState = {
	_id: string;
	likes: number;
	isLiked: boolean;
	createdBy: ProfileReference;
	createdAt: Date | null;
	comments: CommentType[];
	commentsCount: number;
	contents: {
		public_id: string;
		secure_url: string;
	}[];
	caption: string | null;
};

const initialState: PostState = {
	_id: '',
	likes: 0,
	isLiked: false,
	createdBy: {
		id: '',
		username: '',
		profilePic: '',
	},
	createdAt: null,
	commentsCount: 0,
	contents: [],
	caption: '',
	comments: [],
};

const postSlice = createSlice({
	name: 'post',
	initialState: initialState,
	reducers: {
		setPost: (state, action: PayloadAction<PostState>) => {
			action.payload.comments = [];

			return action.payload;
		},
		setLikePost: (state, action: PayloadAction<'like' | 'unlike'>) => {
			if (action.payload === 'like') {
				state.isLiked = true;
				state.likes += 1;
			} else {
				state.isLiked = false;
				state.likes -= 1;
			}
		},
		setComments: (state, action: PayloadAction<CommentType[]>) => {
			for (let i = 0; i < action.payload.length; i++) {
				for (let j = 0; j < state.comments.length; j++) {
					if (action.payload[i]._id === state.comments[j]._id) {
						return state;
					}
				}
			}

			state.comments = [...state.comments, ...action.payload];
		},
		addComment: (state, action: PayloadAction<CommentType>) => {
			state.comments = [action.payload, ...state.comments];
		},
		setLikeComment: (
			state,
			action: PayloadAction<{ index: number; action: 'like' | 'unlike' }>
		) => {
			if (action.payload.action === 'like') {
				state.comments[action.payload.index].likes += 1;
				state.comments[action.payload.index].isLiked = true;
			} else {
				state.comments[action.payload.index].likes -= 1;
				state.comments[action.payload.index].isLiked = false;
			}
		},
		deleteComment: (state, action: PayloadAction<number>) => {
			state.comments.splice(action.payload, 1);
		},
		updateComment: (
			state,
			action: PayloadAction<{ index: number; newComment: CommentType }>
		) => {
			state.comments[action.payload.index] = action.payload.newComment;
		},
		replyToComment: (state, action: PayloadAction<{ index: number }>) => {
			state.comments[action.payload.index].repliesCount += 1;
		},
	},
});

// export action creators
export const {
	setPost,
	setLikePost,
	setComments,
	addComment,
	setLikeComment,
	deleteComment,
	updateComment,
	replyToComment,
} = postSlice.actions;

// export reducers
export default postSlice.reducer;
