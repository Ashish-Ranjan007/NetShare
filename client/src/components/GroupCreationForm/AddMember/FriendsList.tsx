import {
	Avatar,
	Box,
	Checkbox,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { ProfileReference } from '../../../@types/responseType';

type props = {
	friends: ProfileReference[];
	selectedFriends: ProfileReference[];
	setSelectedFriends: Dispatch<SetStateAction<ProfileReference[]>>;
};

const customScrollbar = {
	/* width */
	'::-webkit-scrollbar': {
		width: '8px',
	},

	/* Track */
	'::-webkit-scrollbar-track': {
		background: '#f1f1f1',
	},

	/* Handle */
	'::-webkit-scrollbar-thumb': {
		background: '#888',
	},

	/* Handle on hover */
	'::-webkit-scrollbar-thumb:hover': {
		background: '#555',
	},
};

const FriendsList = ({
	friends,
	selectedFriends,
	setSelectedFriends,
}: props) => {
	const isSelected = (id: string): boolean => {
		return selectedFriends.find((friend) => friend.id === id)
			? true
			: false;
	};

	const handleSelect = (checked: boolean, user: ProfileReference) => {
		if (checked) {
			setSelectedFriends((prev) => {
				const result = prev.filter((friend) => friend.id !== user.id);
				return result;
			});
		} else {
			setSelectedFriends((prev) => {
				const result = [...prev, user];
				return result;
			});
		}
	};

	return (
		<Box sx={{ maxHeight: '500px', overflowY: 'auto', ...customScrollbar }}>
			<List>
				{friends.map((friend) => {
					const checked = isSelected(friend.id);
					return (
						<ListItem
							key={friend.id}
							secondaryAction={
								<Checkbox
									edge="end"
									onChange={() => {
										handleSelect(checked, friend);
									}}
									checked={checked}
								/>
							}
							disablePadding
						>
							<ListItemButton>
								<ListItemAvatar>
									<Avatar src={friend.profilePic} />
								</ListItemAvatar>
								<ListItemText primary={friend.username} />
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>
		</Box>
	);
};

export default FriendsList;
