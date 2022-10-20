import { List, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ProfileReference } from '../../../@types/responseType';
import Friend from '../Friend';

type Props = {
	friends: ProfileReference[];
};

const FriendList = ({ friends }: Props) => {
	return (
		<Box sx={{ marginTop: '8px' }}>
			<Typography
				variant="body1"
				sx={{ fontWeight: 500, padding: '8px' }}
			>
				Friends
			</Typography>

			<Box
				sx={{
					height: 'calc(100vh - 160px)',
					overflowY: 'scroll',
					'&::-webkit-scrollbar': { display: 'none' },
					scrollbarWidth: 'none',
				}}
			>
				<List>
					{friends.map((friend) => {
						return <Friend key={friend.id} {...friend} />;
					})}
				</List>
			</Box>
		</Box>
	);
};

export default FriendList;
