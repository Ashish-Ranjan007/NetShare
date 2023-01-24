import { Box } from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import FriendsList from './FriendsList';
import SelectedFriends from './SelectedFriends';
import SearchBar from '../../Friends/SearchBar';
import { useAppSelector } from '../../../app/hooks';
import { ProfileReference } from '../../../@types/responseType';

type FormData = {
	users: ProfileReference[];
	name: string;
	displayPicture: File | null;
};

type props = {
	formData: FormData;
	setFormData: Dispatch<SetStateAction<FormData>>;
};

const AddMember = ({ formData, setFormData }: props) => {
	const auth = useAppSelector((state) => state.auth);

	const [searchTerm, setSearchTerm] = useState<string>('');
	const [selectedFriends, setSelectedFriends] = useState<ProfileReference[]>(
		formData.users
	);
	const [friendsList, setFriendsList] = useState<ProfileReference[]>([]);

	useEffect(() => {
		setFormData((prev) => {
			return {
				users: selectedFriends,
				name: prev.name,
				displayPicture: prev.displayPicture,
			};
		});
	}, [selectedFriends]);

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
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 2,
				marginTop: 2,
			}}
		>
			<SearchBar setSearchTerm={setSearchTerm} />

			<FriendsList
				friends={friendsList}
				selectedFriends={selectedFriends}
				setSelectedFriends={setSelectedFriends}
			/>

			<SelectedFriends
				selectedFriends={selectedFriends}
				setSelectedFriends={setSelectedFriends}
			/>
		</Box>
	);
};

export default AddMember;
