import React, { useState } from 'react';

import NavigationMenu from '../components/NavigationMenu';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Box, Grid } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Friends from '../components/Friends';

const Layout: React.FC = () => {
	//Toggle navigationMenu in mobile view
	const [toggle, setToggle] = useState<boolean>(false);

	return (
		<Box>
			<Header setToggle={setToggle} />

			<Grid
				container
				sx={{
					paddingRight: '8px',
				}}
			>
				<Grid item xs={0} md={2} sx={{ position: { md: 'relative' } }}>
					<NavigationMenu toggle={toggle} setToggle={setToggle} />
				</Grid>

				<Grid item xs={12} sm={9} md={7} lg={8}>
					<Outlet />
				</Grid>

				<Grid item xs={0} sm={3} md={3} lg={2}>
					<Box
						sx={{
							paddingTop: '8px',
							display: { xs: 'none', sm: 'block' },
						}}
					>
						<Friends />
					</Box>
				</Grid>
			</Grid>
		</Box>
	);
};

export default Layout;
