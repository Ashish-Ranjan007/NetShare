import {
	Box,
	Avatar,
	Card,
	Divider,
	List,
	ListItem,
	Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setBirthdays } from '../../../features/widgets/widgetsSlice';
import { useLazyGetBirthdaysQuery } from '../../../features/widgets/widgetsApiSlice';

const defaultProfilePic =
	'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80';

const Birthdays = () => {
	const dispatch = useAppDispatch();
	const [trigger, { data, isSuccess }] = useLazyGetBirthdaysQuery();
	const birthdays = useAppSelector((state) => state.widgets.birthdays);

	useEffect(() => {
		(async () => {
			if (birthdays.length === 0) {
				await trigger();
				if (isSuccess && data) {
					dispatch(setBirthdays(data.data.friends));
				}
			}
		})();
	}, [birthdays, data, isSuccess]);

	return (
		<Box>
			<Card variant="outlined">
				<Typography sx={{ padding: '8px 16px', fontWeight: '500' }}>
					Birthdays
				</Typography>

				<Divider />

				{birthdays.length > 0 && (
					<List>
						{birthdays.map((friend) => (
							<ListItem
								key={friend.id}
								sx={{
									':hover': {
										backgroundColor: '#eee',
									},
									transition: 'all 300ms ease',
								}}
							>
								<Link
									to={`/profile/${friend.username}/${friend.id}`}
									style={{
										color: 'inherit',
										display: 'flex',
										alignItems: 'center',
										gap: '24px',
									}}
								>
									<Avatar
										src={
											friend.profilePic.length > 0
												? friend.profilePic
												: defaultProfilePic
										}
										alt={`${friend.username}'s profile picture`}
									/>
									<Typography>{friend.username}</Typography>
								</Link>
							</ListItem>
						))}
					</List>
				)}

				{birthdays.length === 0 && (
					<Box sx={{ padding: '8px 16px' }}>
						<Typography textAlign="center">
							No Birthdays Today
						</Typography>
					</Box>
				)}
			</Card>
		</Box>
	);
};

export default Birthdays;
