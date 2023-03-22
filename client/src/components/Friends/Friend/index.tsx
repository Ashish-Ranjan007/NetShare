import {
	Avatar,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { ProfileReference } from '../../../@types/responseType';

const Friend = ({ _id, profilePic, username }: ProfileReference) => {
	return (
		<ListItem sx={{ padding: '0px' }}>
			<Link
				to={`/profile/${username}/${_id}`}
				style={{
					width: '100%',
					display: 'block',
					textDecoration: 'none',
					color: 'inherit',
				}}
			>
				<ListItemButton sx={{ padding: '8px 8px' }}>
					<ListItemIcon>
						<Avatar
							sx={{
								width: '32px',
								height: '32px',
							}}
							src={profilePic}
						/>
					</ListItemIcon>
					<ListItemText primary={username} />
				</ListItemButton>
			</Link>
		</ListItem>
	);
};

export default Friend;
