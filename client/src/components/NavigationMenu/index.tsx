import {
	Badge,
	Box,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import {
	Explore,
	Message,
	RssFeed,
	Notifications,
	Person,
	Settings,
	Logout,
	People,
	AddCircle,
} from '@mui/icons-material';
import {
	CREATE,
	EXPLORE,
	MESSAGES,
	NOTIFICATIONS,
	SETTINGS,
} from '../../constants/routes';
import { NavLink } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';
import { logout } from '../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useLogoutMutation } from '../../features/auth/authApiSlice';

type Props = {
	toggle: boolean;
	setToggle: Dispatch<SetStateAction<boolean>>;
};

const NavigationMenu = (props: Props) => {
	const dispatch = useAppDispatch();
	const [postLogout] = useLogoutMutation();
	const auth = useAppSelector((state) => state.auth);

	const navList = [
		{
			name: 'Feed',
			icon: <RssFeed />,
			link: '/',
		},
		{
			name: 'Explore',
			icon: <Explore />,
			link: EXPLORE,
		},
		{
			name: 'Create',
			icon: <AddCircle />,
			link: CREATE,
		},
		{
			name: 'Messages',
			icon: <Message />,
			link: MESSAGES,
		},
		{
			name: 'Notifications',
			icon: <Notifications />,
			link: NOTIFICATIONS,
		},
		{
			name: 'Settings',
			icon: <Settings />,
			link: SETTINGS,
		},
		{
			name: 'Profile',
			icon: <Person />,
			link: `/profile/${auth.username}/${auth._id}`,
		},
	];

	const handleClick = async () => {
		await postLogout();
		dispatch(logout());
	};

	return (
		<Box
			sx={{
				position: 'absolute',
				bottom: '0px',
				left: '0',
				transform: {
					xs: props.toggle ? 'translateX(0%)' : 'translateX(-100%)',
					md: 'none',
				},
				transition: 'transform 300ms ease-in-out',
				background: {
					xs: '#f0f0f0',
					md: 'white',
				},
				width: { md: '100%' },
				height: 'calc(100vh - 64px)',
				zIndex: 999,
			}}
		>
			<List sx={{ width: '100%' }}>
				{navList.map((nav) => (
					<ListItem sx={{ padding: '0px' }} key={nav.name}>
						<NavLink
							to={nav.link}
							style={{
								width: '100%',
								display: 'block',
								textDecoration: 'none',
								color: 'inherit',
							}}
							onClick={() => props.setToggle((prev) => !prev)}
						>
							<ListItemButton>
								<ListItemIcon>{nav.icon}</ListItemIcon>
								{nav.name === 'Notifications' &&
								auth.notifications > 0 ? (
									<Badge
										badgeContent={auth.notifications}
										color="primary"
										anchorOrigin={{
											vertical: 'top',
											horizontal: 'right',
										}}
									>
										<ListItemText
											primary={nav.name}
											sx={{ letterSpacing: '0.045rem' }}
										/>
									</Badge>
								) : (
									<ListItemText
										primary={nav.name}
										sx={{ letterSpacing: '0.045rem' }}
									/>
								)}
							</ListItemButton>
						</NavLink>
					</ListItem>
				))}
				<ListItem sx={{ padding: '0px', display: { md: 'none' } }}>
					<NavLink
						to="/friends"
						style={{
							width: '100%',
							display: 'block',
							textDecoration: 'none',
							color: 'inherit',
						}}
						onClick={() => props.setToggle((prev) => !prev)}
					>
						<ListItemButton>
							<ListItemIcon>
								<People />
							</ListItemIcon>
							<ListItemText primary="Friends" />
						</ListItemButton>
					</NavLink>
				</ListItem>
				<ListItem onClick={handleClick} sx={{ padding: '0px' }}>
					<ListItemButton>
						<ListItemIcon>
							<Logout />
						</ListItemIcon>
						<ListItemText primary="Logout" />
					</ListItemButton>
				</ListItem>
			</List>
		</Box>
	);
};

export default NavigationMenu;
