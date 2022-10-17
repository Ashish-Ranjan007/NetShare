import { Box } from '@mui/material';
import FriendList from './FriendList';
import SearchFriends from './SearchFriends';

const Sidebar = () => {
	return (
		<Box sx={{ paddingTop: '8px', display: { xs: 'none', sm: 'block' } }}>
			<SearchFriends />
			<FriendList />
		</Box>
	);
};

export default Sidebar;
