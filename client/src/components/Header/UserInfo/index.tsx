import { Link } from 'react-router-dom';
import { Avatar, Box, Stack, Typography } from '@mui/material';

import { useAppSelector } from '../../../app/hooks';

const UserInfo = () => {
	const auth = useAppSelector((state) => state.auth);

	return (
		<Stack
			spacing={2}
			direction="row"
			justifyContent="flex-end"
			alignItems="center"
		>
			<Typography
				variant="body1"
				sx={{
					color: '#4E5D78',
					fontWeight: '500',
					display: { xs: 'none', lg: 'block' },
				}}
			>
				<Link
					to={`/profile/${auth.username}/${auth._id}`}
					style={{
						textDecoration: 'none',
						color: '#4E5D78',
					}}
				>
					{auth.username}
				</Link>
			</Typography>
			<Avatar
				sx={{ width: '32px', height: '32px' }}
				src={auth.profilePic}
			/>
		</Stack>
	);
};

export default UserInfo;
