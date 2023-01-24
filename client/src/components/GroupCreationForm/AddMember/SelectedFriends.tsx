import { Close } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { ProfileReference } from '../../../@types/responseType';

type props = {
	selectedFriends: ProfileReference[];
	setSelectedFriends: Dispatch<SetStateAction<ProfileReference[]>>;
};

const SelectedFriends = ({ selectedFriends, setSelectedFriends }: props) => {
	const handleRemoveSelection = (id: string) => {
		setSelectedFriends((prev) => {
			const result = prev.filter((prev) => prev.id !== id);
			return result;
		});
	};

	return (
		<Box>
			{selectedFriends.map((friend) => (
				<Button
					sx={{
						textTransform: 'unset',
						padding: '4px 8px',
						margin: '2px',
					}}
					key={friend.id}
					variant="contained"
					color="inherit"
					disableElevation
					endIcon={<Close />}
					onClick={() => handleRemoveSelection(friend.id)}
				>
					{friend.username}
				</Button>
			))}
		</Box>
	);
};

export default SelectedFriends;
