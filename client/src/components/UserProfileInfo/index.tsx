import { Avatar, Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
	useFollowMutation,
	useLazyGetUserDetailsQuery,
	useUnFollowMutation,
} from '../../features/auth/authApiSlice';
import UserListModal from '../UserListModal';

const defaultProfilePic =
	'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80';

const UserProfileInfo = ({ username }: { username: string | undefined }) => {
	const navigate = useNavigate();
	const [postFollowUser] = useFollowMutation();
	const [postUnFollowUser] = useUnFollowMutation();
	const [trigger, { data, isError, error }] = useLazyGetUserDetailsQuery();

	const [isDisabled, setIsDisabled] = useState<boolean>(false);
	const [isFollowing, setIsFollowing] = useState<boolean>(false);
	const [openFollowers, setOpenFollowers] = useState<boolean>(false);
	const [openFollowings, setOpenFollowings] = useState<boolean>(false);

	useEffect(() => {
		if (username && username.length > 0) {
			trigger(username);
		}

		if (data) {
			setIsFollowing(data.data.user.isFollowing);
		}
	}, [data]);

	const handleFollow = async () => {
		if (!data) return;

		setIsDisabled(true);

		if (isFollowing) {
			const returned = await postUnFollowUser(
				data.data.user._id
			).unwrap();
			if (returned.success) setIsFollowing(false);
		} else {
			const returned = await postFollowUser(data.data.user._id).unwrap();
			if (returned.success) setIsFollowing(true);
		}

		setIsDisabled(false);
	};

	return (
		<>
			{data && (
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', lg: 'row' },
					}}
				>
					<Box
						sx={{
							flex: '1',
							display: 'flex',
							alignItems: { xs: 'flex-start', lg: 'center' },
							justifyContent: { xs: 'flex-start', lg: 'center' },
						}}
					>
						<Avatar
							sx={{
								width: '156px',
								height: '156px',
								margin: { xs: '16px 0px', lg: 'auto' },
								border: '2px solid #1976d2',
							}}
							src={
								data.data.user.profilePic.length > 0
									? data.data.user.profilePic
									: defaultProfilePic
							}
							alt="profile picture"
						/>
					</Box>

					<Box sx={{ flex: '1', marginTop: { xs: '32px', lg: '0' } }}>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: '24px',
							}}
						>
							<Typography variant="h5">
								{data.data.user.username}
							</Typography>
							<Button
								sx={{
									textTransform: 'capitalize',
									padding: '2px 16px',
								}}
								variant="outlined"
								onClick={handleFollow}
								disabled={isDisabled}
							>
								{isFollowing ? 'Unfollow' : 'Follow'}
							</Button>
						</Box>
						<Box
							sx={{
								marginTop: '24px',
								display: 'flex',
								alignItems: 'center',
								gap: '24px',
							}}
						>
							<Typography
								sx={{ color: 'black', fontWeight: '500' }}
							>
								{data.data.user.postsCount + ' '}
								<Typography
									component="span"
									sx={{ color: '#4E5D78' }}
								>
									Posts
								</Typography>
							</Typography>
							<Typography
								sx={{ color: 'black', fontWeight: '500' }}
							>
								{data.data.user.followersCount + ' '}
								<Typography
									component="span"
									sx={{ color: '#4E5D78', cursor: 'pointer' }}
									onClick={() => setOpenFollowers(true)}
								>
									Followers
								</Typography>
							</Typography>
							<Typography
								sx={{ color: 'black', fontWeight: '500' }}
							>
								{data.data.user.followingsCount + ' '}
								<Typography
									component="span"
									sx={{ color: '#4E5D78', cursor: 'pointer' }}
									onClick={() => setOpenFollowings(true)}
								>
									Followings
								</Typography>
							</Typography>
						</Box>
						<Box sx={{ marginTop: '24px' }}>
							<Typography
								sx={{ textTransform: 'capitalize' }}
								component="span"
								variant="h5"
							>
								{data.data.user.firstname + ' '}
							</Typography>
							<Typography
								sx={{ textTransform: 'capitalize' }}
								component="span"
								variant="h5"
							>
								{data.data.user.lastname}
							</Typography>
						</Box>
						<Box sx={{ marginTop: '24px' }}>
							<Typography color="GrayText">Bio</Typography>
							<Typography>{data.data.user.bio}</Typography>
						</Box>
					</Box>
					<UserListModal
						open={openFollowers}
						onClose={() => setOpenFollowers(false)}
						usersType="followers"
						userId={data.data.user._id}
					/>
					<UserListModal
						open={openFollowings}
						onClose={() => setOpenFollowings(false)}
						usersType="followings"
						userId={data.data.user._id}
					/>
				</Box>
			)}
			{error && <Typography align="center">User Not Found</Typography>}
		</>
	);
};

export default UserProfileInfo;
