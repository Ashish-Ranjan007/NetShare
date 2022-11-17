import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
	Box,
	createTheme,
	Grid,
	LinearProgress,
	ThemeProvider,
} from '@mui/material';

import Header from '../components/Header';
import Friends from '../components/Friends';
import ProgressContex from '../context/progress';
import NavigationMenu from '../components/NavigationMenu';

const theme = createTheme({
	palette: {
		primary: {
			main: '#2998ff',
		},
	},
});

const Layout: React.FC = () => {
	//Toggle navigationMenu in mobile view
	const [progress, setProgress] = useState<number>(0);
	const [toggle, setToggle] = useState<boolean>(false);

	return (
		<Box>
			<ThemeProvider theme={theme}>
				<LinearProgress
					sx={{
						visibility:
							progress > 0 && progress < 100
								? 'visible'
								: 'hidden',
						position: 'absolute',
						left: '0',
						right: '0',
					}}
					variant="determinate"
					value={progress}
				/>
			</ThemeProvider>
			<Header setToggle={setToggle} />

			<Grid
				container
				sx={{
					paddingX: { xs: '8px', sm: '0px' },
				}}
			>
				<Grid
					item
					xs={0}
					md={3}
					lg={2}
					sx={{ position: { md: 'relative' } }}
				>
					<NavigationMenu toggle={toggle} setToggle={setToggle} />
				</Grid>

				<Grid
					item
					xs={12}
					sm={9}
					md={6}
					lg={8}
					sx={{
						background: '#f5f5f5',
						borderRadius: '16px',
						padding: { sm: '16px 16px 0px 16px' },
					}}
				>
					<ProgressContex.Provider value={setProgress}>
						<Outlet />
					</ProgressContex.Provider>
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
