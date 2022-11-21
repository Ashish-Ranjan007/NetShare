import { Avatar, List, ListItem, Modal, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProfileReference } from '../../@types/responseType';
import {
	useLazyFollowersQuery,
	useLazyFollowingsQuery,
} from '../../features/auth/authApiSlice';

const defaultProfilePic =
	'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80';

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
								key={user.id}
								sx={{
									':hover': {
										backgroundColor: '#eee',
									},
									transition: 'all 300ms ease',
								}}
							>
								<Link
									to={`/profile/${user.username}/${user.id}`}
									style={{
										color: 'inherit',
										display: 'flex',
										alignItems: 'center',
										gap: '24px',
									}}
								>
									<Avatar
										src={
											user.profilePic.length > 0
												? user.profilePic
												: defaultProfilePic
										}
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
