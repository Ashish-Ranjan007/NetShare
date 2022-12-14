import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

import FriendList from './FriendList';
import SearchFriends from './SearchFriends';
import { useAppSelector } from '../../app/hooks';
import { ProfileReference } from '../../@types/responseType';

const Sidebar = () => {
	const auth = useAppSelector((state) => state.auth);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [friendsList, setFriendsList] = useState<ProfileReference[]>([]);

	useEffect(() => {
		// If there is no searchTerm render all friends
		if (searchTerm.length === 0) {
			setFriendsList(auth.friends);
		} else {
			// Render friends that matches the searchTerm
			const newFriendsList = auth.friends.filter((friend) => {
				const re = new RegExp(searchTerm, 'i');
				if (friend.username.match(re)) {
					return true;
				} else {
					return false;
				}
			});

			setFriendsList(newFriendsList);
		}
	}, [searchTerm]);

	return (
		<Box sx={{ paddingTop: '8px', display: { xs: 'none', sm: 'block' } }}>
			<SearchFriends setSearchTerm={setSearchTerm} />
			<FriendList friends={friendsList} />
		</Box>
	);
};

export default Sidebar;
