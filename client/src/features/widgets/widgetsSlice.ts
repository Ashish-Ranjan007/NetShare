import { ProfileReference } from '../../@types/responseType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: {
	suggestedProfiles: ProfileReference[];
	birthdays: ProfileReference[];
} = {
	suggestedProfiles: [],
	birthdays: [],
};

const widgetsSlice = createSlice({
	name: 'widgets',
	initialState: initialState,
	reducers: {
		setSuggestedProfiles: (
			state,
			action: PayloadAction<ProfileReference[]>
		) => {
			state.suggestedProfiles = action.payload;
		},
		setBirthdays: (state, action: PayloadAction<ProfileReference[]>) => {
			state.birthdays = action.payload;
		},
	},
});

// export action creators
export const { setSuggestedProfiles, setBirthdays } = widgetsSlice.actions;

// export reducers
export default widgetsSlice.reducer;
