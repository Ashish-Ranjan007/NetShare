import { Box } from '@mui/system';
import Friends from '../components/Friends';

const FriendsPage = () => {
	return (
		<Box
			sx={{
				display: { xs: 'flex', sm: 'none' },
				justifyContent: 'center',
				width: '100%',
			}}
		>
			<Friends />
		</Box>
	);
};

export default FriendsPage;
