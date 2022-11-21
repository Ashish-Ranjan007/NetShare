import { Link } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';

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
					to={`/profile/${auth.username}/${auth.id}`}
					style={{
						textDecoration: 'none',
						color: '#4E5D78',
					}}
				>
					{auth.username}
				</Link>
			</Typography>
			<Box
				component="img"
				sx={{
					width: 32,
					borderRadius: '10px',
				}}
				src={
					auth.profilePic?.length > 0
						? auth.profilePic
						: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80'
				}
				alt="logo image"
			/>
		</Stack>
	);
};

export default UserInfo;
