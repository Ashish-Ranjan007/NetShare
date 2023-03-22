import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Avatar, List, ListItem, Modal, Typography } from '@mui/material';

import {
	useLazyFollowersQuery,
	useLazyFollowingsQuery,
} from '../../features/auth/authApiSlice';
import { ProfileReference } from '../../@types/responseType';

const UserListModal = ({
	open,
	onClose,
	userId,
	usersType,
}: {
	open: boolean;
	onClose: Dispatch<SetStateAction<boolean>>;
	userId: string;
	usersType: 'followers' | 'followings';
}) => {
	const [users, setUsers] = useState<ProfileReference[]>([]);

	const [getFollowers, followersData] = useLazyFollowersQuery();
	const [getFollowings, followingsData] = useLazyFollowingsQuery();

	useEffect(() => {
		if (open) {
			if (usersType === 'followers') {
				getFollowers(userId);
			} else {
				getFollowings(userId);
			}
		}
	}, [open]);

	useEffect(() => {
		setUsers(followersData.data?.data.followers || []);
	}, [followersData]);

	useEffect(() => {
		setUsers(followingsData.data?.data.followings || []);
	}, [followingsData]);

	return (
		<>
			<Modal open={open} onClose={onClose}>
				<Box
					sx={{
						position: 'absolute' as 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						bgcolor: 'background.paper',
						boxShadow: 24,
						maxWidth: '500px',
						paddingY: '16px',
						borderRadius: '5px',
						maxHeight: '250px',
						overflowY: 'scroll',
					}}
				>
					<List>
						{users.map((user) => (
							<ListItem
								onClick={() => onClose(false)}
								key={user._id}
								sx={{
									':hover': {
										backgroundColor: '#eee',
									},
									transition: 'all 300ms ease',
								}}
							>
								<Link
									to={`/profile/${user.username}/${user._id}`}
									style={{
										color: 'inherit',
										display: 'flex',
										alignItems: 'center',
										gap: '24px',
									}}
								>
									<Avatar
										src={user.profilePic}
										alt={`${user.username}'s profile picture`}
									/>
									<Typography>{user.username}</Typography>
								</Link>
							</ListItem>
						))}
					</List>
				</Box>
			</Modal>
		</>
	);
};

export default UserListModal;
