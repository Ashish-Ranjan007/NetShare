import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

import SearchBar from './SearchBar';
import FriendList from './FriendList';
import { useAppSelector } from '../../app/hooks';
import { ProfileReference } from '../../@types/responseType';

const Friends = () => {
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
		<Box>
			<SearchBar setSearchTerm={setSearchTerm} />
			<FriendList friends={friendsList} />
		</Box>
	);
};

export default Friends;
