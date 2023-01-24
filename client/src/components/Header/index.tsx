import { Box, Grid, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CssBaseline from '@mui/material/CssBaseline';

import UserInfo from './UserInfo';
import Searchbar from './Searchbar';
import logo from '../../assets/netshare3.png';
import { Dispatch, SetStateAction } from 'react';

type Props = {
	setToggle: Dispatch<SetStateAction<boolean>>;
};

const Header = (props: Props) => {
	return (
		<>
			<CssBaseline />
			<Grid container sx={{ alignItems: 'center', padding: '8px 16px' }}>
				<Grid item xs={8} sm={3} lg={2}>
					<Box
						component="img"
						sx={{
							width: 160,
							position: 'relative',
						}}
						src={logo}
						alt="logo image"
					/>
				</Grid>

				<Grid
					item
					sm={8}
					md={7}
					lg={8}
					sx={{
						display: {
							xs: 'none',
							sm: 'block',
						},
					}}
				>
					<Searchbar />
				</Grid>

				<Grid
					item
					md={2}
					sx={{
						display: {
							xs: 'none',
							md: 'block',
						},
					}}
				>
					<UserInfo />
				</Grid>

				<Grid
					item
					xs={4}
					sm={1}
					sx={{
						display: {
							xs: 'flex',
							md: 'none',
						},
						justifyContent: 'flex-end',
					}}
				>
					<IconButton
						onClick={() => props.setToggle((prev) => !prev)}
					>
						<MenuIcon fontSize="large" />
					</IconButton>
				</Grid>

				<Grid
					item
					sm={12}
					sx={{
						display: {
							xs: 'flex',
							sm: 'none',
						},
						justifyContent: 'center',
						width: '100%',
						marginTop: '10px',
					}}
				>
					<Searchbar mobile={true} />
				</Grid>
			</Grid>
		</>
	);
};

export default Header;
