import { useState } from 'react';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

const SettingsPage = () => {
	const [active, setActive] = useState<'profile' | 'password' | 'account'>(
		'profile'
	);

	return (
		<Box
			sx={{
				height: 'calc(100vh - 80px)',
				overflowY: 'auto',
				paddingLeft: { sm: '16px' },
			}}
		>
			<Box
				sx={{
					width: '100%',
					borderBottom: '1px solid #dbdbdb',
					display: 'flex',
					justifyContent: 'space-around',
					whiteSpace: 'nowrap',
					overflowY: 'auto',
				}}
			>
				<Link
					to="/settings"
					onClick={() => setActive('profile')}
					style={{
						color: 'inherit',
						borderBottom:
							active === 'profile' ? '2px solid red' : '',
					}}
				>
					<Typography
						sx={{
							padding: {
								xs: '10px 0px',
								md: '0px 16px',
								color: active === 'profile' ? 'red' : '',
							},
						}}
					>
						Profile
					</Typography>
				</Link>
				<Link
					to="/settings/change-password"
					onClick={() => setActive('password')}
					style={{
						color: 'inherit',
						borderBottom:
							active === 'password' ? '2px solid red' : '',
					}}
				>
					<Typography
						sx={{
							padding: {
								xs: '10px 0px',
								md: '0px 16px',
								color: active === 'password' ? 'red' : '',
							},
						}}
					>
						Change Password
					</Typography>
				</Link>
				<Link
					to="/settings/delete-account"
					onClick={() => setActive('account')}
					style={{
						color: 'inherit',
						borderBottom:
							active === 'account' ? '2px solid red' : '',
					}}
				>
					<Typography
						sx={{
							padding: {
								xs: '10px 0px',
								md: '0px 16px',
								color: active === 'account' ? 'red' : '',
							},
						}}
					>
						Delete Account
					</Typography>
				</Link>
			</Box>
			<Outlet />
		</Box>
	);
};

export default SettingsPage;
