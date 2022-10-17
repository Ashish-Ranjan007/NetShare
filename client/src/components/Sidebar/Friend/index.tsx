import {
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';

const Item = () => {
	return (
		<ListItem sx={{ padding: '0px' }}>
			<ListItemButton sx={{ padding: '8px 8px' }}>
				<ListItemIcon>
					<Box
						component="img"
						sx={{
							width: 32,
							borderRadius: '100px',
						}}
						src="https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80"
						alt="logo image"
					/>
				</ListItemIcon>
				<ListItemText primary="Mr. Kitty Kat" />
			</ListItemButton>
		</ListItem>
	);
};

const Friend = () => {
	const items = [];

	for (let i = 0; i < 25; i++) {
		items.push(Item);
	}

	return (
		<Box
			sx={{
				height: 'calc(100vh - 160px)',
				overflowY: 'scroll',
				'&::-webkit-scrollbar': { display: 'none' },
				scrollbarWidth: 'none',
			}}
		>
			<List>
				{items.map((item) => {
					return <Item />;
				})}
			</List>
		</Box>
	);
};

export default Friend;
