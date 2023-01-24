import { Box, Typography } from '@mui/material';

import { useParams } from 'react-router-dom';
import UserProfileInfo from '../components/UserProfileInfo';
import UserProfilePostList from '../components/UserProfilePostList';

const ProfilePage = () => {
	const { username, id } = useParams();

	return (
		<Box
			sx={{
				paddingLeft: { sm: '16px' },
				height: 'calc(100vh - 80px)',
				overflowY: 'auto',
			}}
		>
			<UserProfileInfo username={username} />

			<Typography align="center" variant="h5" sx={{ marginTop: '32px' }}>
				POSTS
			</Typography>
			<hr style={{ borderColor: '#e7e7e7', marginBottom: '32px' }} />

			<UserProfilePostList userId={id} />
		</Box>
	);
};

export default ProfilePage;
