import { ProfileReference } from '../../@types/responseType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PostState = {
	_id: string;
	likes: number;
	isLiked: boolean;
	createdBy: ProfileReference;
	createdAt: Date | null;
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
};

const postSlice = createSlice({
	name: 'post',
	initialState: initialState,
	reducers: {
		setPost: (state, action: PayloadAction<PostState>) => {
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
	},
});

// export action creators
export const { setPost, setLikePost } = postSlice.actions;

// export reducers
export default postSlice.reducer;
