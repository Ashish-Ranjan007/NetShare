import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationType } from '../../@types/responseType';

const initialState: NotificationType[] = [];

export const notificationSlice = createSlice({
	name: 'notifications',
	initialState,
	reducers: {
		setNotificaitons: (
			state,
			action: PayloadAction<NotificationType[]>
		) => {
			return state.concat(action.payload);
		},
	},
});

// Export action creators
export const { setNotificaitons } = notificationSlice.actions;

// Export reducers
export default notificationSlice.reducer;
