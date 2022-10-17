import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import Friend from '../Friend';

// const

const FriendList = () => {
	return (
		<Box sx={{ marginTop: '8px' }}>
			<Typography
				variant="body1"
				sx={{ fontWeight: 500, padding: '8px' }}
			>
				Friends
			</Typography>
			<Friend />
		</Box>
	);
};

export default FriendList;
