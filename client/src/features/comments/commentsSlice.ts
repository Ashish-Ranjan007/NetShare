import { CommentType } from '../post/postApiSlice';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: CommentType[] = [];

export const commentSlice = createSlice({
	name: 'comments',
	initialState: initialState,
	reducers: {
		setComments: (state, action: PayloadAction<CommentType[]>) => {
			return state.concat(action.payload);
		},
		addComment: (state, action: PayloadAction<CommentType>) => {
			state.unshift(action.payload);
		},
		setLikeComment: (
			state,
			action: PayloadAction<{ index: number; action: 'like' | 'unlike' }>
		) => {
			if (action.payload.action === 'like') {
				state[action.payload.index].likes += 1;
				state[action.payload.index].isLiked = true;
			} else {
				state[action.payload.index].likes -= 1;
				state[action.payload.index].isLiked = false;
			}
		},
		deleteComment: (state, action: PayloadAction<number>) => {
			state.splice(action.payload, 1);
		},
		updateComment: (
			state,
			action: PayloadAction<{ index: number; newComment: CommentType }>
		) => {
			state[action.payload.index] = action.payload.newComment;
		},
		replyToComment: (state, action: PayloadAction<{ index: number }>) => {
			state[action.payload.index].repliesCount += 1;
		},
	},
});

// export action creators
export const {
	setComments,
	addComment,
	setLikeComment,
	updateComment,
	deleteComment,
	replyToComment,
} = commentSlice.actions;

// export reducers
export default commentSlice.reducer;
