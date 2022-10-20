import {
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { ProfileReference } from '../../../@types/responseType';

const defaultProfilePic =
	'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80';

const Friend = ({ id, profilePic, username }: ProfileReference) => {
	return (
		<ListItem sx={{ padding: '0px' }}>
			<Link
				to={`/profile/${username}`}
				style={{
					width: '100%',
					display: 'block',
					textDecoration: 'none',
					color: 'inherit',
				}}
			>
				<ListItemButton sx={{ padding: '8px 8px' }}>
					<ListItemIcon>
						<Box
							component="img"
							sx={{
								width: 32,
								borderRadius: '100px',
							}}
							src={
								profilePic.length > 0
									? profilePic
									: defaultProfilePic
							}
							alt="logo image"
						/>
					</ListItemIcon>
					<ListItemText primary={username} />
				</ListItemButton>
			</Link>
		</ListItem>
	);
};

export default Friend;
