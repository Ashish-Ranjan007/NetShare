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
									':hover': {
										background: '#f0f0f0',
									},
								}}
							>
								<Avatar
									src={profile.profilePic}
									alt={`${profile.username}'s profile picture`}
								/>
								<Link
									to={`/profile/${profile.username}/${profile.id}`}
									style={{
										width: '100%',
										color: 'inherit',
										textAlign: 'left',
										paddingLeft: '8px',
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
