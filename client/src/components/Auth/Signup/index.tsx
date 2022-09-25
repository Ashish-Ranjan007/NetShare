import {
	Container,
	Grid,
	Box,
	Stack,
	Typography,
	createTheme,
	ThemeProvider,
} from '@mui/material';
import { Link } from 'react-router-dom';

import SignupForm from './SignupForm';
import logo from '../../../assets/netshare4.png';

const theme = createTheme({
	palette: {
		primary: {
			main: '#0095F6',
		},
	},
	typography: {
		fontFamily: 'Poppins, Roboto, Helvetica Neue, Arial',
	},
});

const Signup = () => {
	return (
		<Container
			disableGutters
			maxWidth="lg"
			sx={{
				backgroundColor: 'white',
				height: '100%',
			}}
		>
			<Grid
				container
				alignItems="stretch"
				sx={{
					height: '100%',
				}}
			>
				<Grid
					item
					xs={4}
					sx={{
						display: { xs: 'none', md: 'block' },
					}}
				>
					<Box
						style={{ backgroundColor: 'black' }}
						sx={{
							position: 'relative',
							height: '100%',
							'::before': {
								content: '""',

								backgroundImage:
									"url('https://images.unsplash.com/photo-1542652735873-fb2825bac6e2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80')",
								backgroundRepeat: 'no-repeat',
								backgroundPosition: 'left top',
								backgroundSize: 'cover',
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								opacity: 0.8,
							},
						}}
					>
						<Box
							component="img"
							sx={{
								width: 256,
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
							}}
							src={logo}
							alt="logo image"
						/>
					</Box>
				</Grid>

				<Grid item xs={12} md={8}>
					<Box sx={{ mx: 5, my: 2 }}>
						<Stack spacing={3}>
							<ThemeProvider theme={theme}>
								<Typography
									variant="h4"
									sx={{
										fontSize: 32,
										letterSpacing: '0.025em',
										textDecoration: 'underline #0095F6',
									}}
								>
									Register
								</Typography>
								<Typography
									variant="h6"
									sx={{
										fontSize: 16,
										letterSpacing: '0.075rem',
									}}
								>
									Signup for a new account
								</Typography>
								<Typography
									variant="subtitle1"
									sx={{
										maxWidth: {
											xs: '700',
											sm: 400,
										},
										fontSize: 14,
										color: '#757575',
									}}
								>
									Set up an account to get started. You can
									then start personalizing your profile.
								</Typography>
								<SignupForm />
								<Typography
									component="body"
									sx={{
										letterSpacing: { sm: '0.045rem' },
									}}
								>
									Already have an account ?
									<Link
										to="/login"
										role="link"
										style={{ textDecoration: 'none' }}
										aria-label="Signup if you don't already have an account"
									>
										<Typography
											component="span"
											color="primary"
											sx={{
												color: 'primary.main',
												ml: 1,
												fontWeight: 'bold',
											}}
										>
											Log In
										</Typography>
									</Link>
								</Typography>
							</ThemeProvider>
						</Stack>
					</Box>
				</Grid>
			</Grid>
		</Container>
	);
};

export default Signup;

// Photo by <a href="https://unsplash.com/@ditakesphotos?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Diana Parkhouse</a> on <a href="https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
