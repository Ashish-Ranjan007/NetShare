import {
	Box,
	Avatar,
	Card,
	Divider,
	List,
	ListItem,
	Typography,
	Button,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useFollowMutation } from '../../../features/auth/authApiSlice';
import { setSuggestedProfiles } from '../../../features/widgets/widgetsSlice';
import { useLazyGetSuggestedProfilesQuery } from '../../../features/widgets/widgetsApiSlice';

const defaultProfilePic =
	'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80';

const SuggestedProfiles = () => {
	const dispatch = useAppDispatch();
	const [postFollowUser] = useFollowMutation();
	const [trigger, { data, isSuccess }] = useLazyGetSuggestedProfilesQuery();
	const suggestedProfiles = useAppSelector(
		(state) => state.widgets.suggestedProfiles
	);
	const [isDisabled, setIsDisabled] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			if (suggestedProfiles.length === 0) {
				await trigger();

				if (isSuccess && data) {
					dispatch(setSuggestedProfiles(data.data.suggestedProfiles));
				}
			}
		})();
	}, [suggestedProfiles, data, isSuccess]);

	const handleFollow = async (userId: string) => {
		setIsDisabled(true);
		const returned = await postFollowUser(userId).unwrap();

		if (returned.success) {
			const updatedSuggestions = suggestedProfiles.filter(
				(profile) => profile.id !== userId
			);
			dispatch(setSuggestedProfiles(updatedSuggestions));
		}

		setIsDisabled(false);
	};

	return (
		<Box>
			<Card variant="outlined">
				<Typography sx={{ padding: '8px 16px', fontWeight: '500' }}>
					Suggested Profiles
				</Typography>

				<Divider />

				{suggestedProfiles.length > 0 && (
					<List>
						{suggestedProfiles.map((profile) => (
							<ListItem
								key={profile.id}
								sx={{
									transition: 'all 300ms ease',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
								}}
							>
								<Avatar
									src={
										profile.profilePic.length > 0
											? profile.profilePic
											: defaultProfilePic
									}
									alt={`${profile.username}'s profile picture`}
								/>
								<Link
									to={`/profile/${profile.username}/${profile.id}`}
									style={{
										width: '100%',
										color: 'inherit',
										textAlign: 'center',
									}}
								>
									{profile.username}
								</Link>
								<Button
									onClick={() => handleFollow(profile.id)}
									variant="contained"
									size="small"
									sx={{ textTransform: 'capitalize' }}
									disabled={isDisabled}
									disableElevation
								>
									Follow
								</Button>
							</ListItem>
						))}
					</List>
				)}

				{suggestedProfiles.length === 0 && (
					<Box sx={{ padding: '8px 16px' }}>
						<Typography textAlign="center">
							No Suggested Profiles
						</Typography>
					</Box>
				)}
			</Card>
		</Box>
	);
};

export default SuggestedProfiles;
