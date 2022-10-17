import React, { useState } from 'react';

import NavigationMenu from '../components/NavigationMenu';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Box, Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
	//Toggle navigationMenu in mobile view
	const [toggle, setToggle] = useState<boolean>(false);

	return (
		<Box>
			<Header setToggle={setToggle} />

			<Grid
				container
				sx={{
					paddingRight: '16px',
				}}
			>
				<Grid item xs={0} md={2} sx={{ position: { md: 'relative' } }}>
					<NavigationMenu toggle={toggle} setToggle={setToggle} />
				</Grid>

				<Grid item xs={12} md={8}>
					<Outlet />
				</Grid>

				<Grid item xs={0} md={2}>
					<Sidebar />
				</Grid>
			</Grid>
		</Box>
	);
};

export default Layout;
