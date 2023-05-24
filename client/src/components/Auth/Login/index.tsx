import {
	Container,
	Grid,
	Typography,
	Stack,
	createTheme,
	ThemeProvider,
} from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';

import LoginForm from './LoginForm';
import logo from '../../../assets/netshare3.png';

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

const Login = () => {
	return (
		<ThemeProvider theme={theme}>
			<Container
				disableGutters
				maxWidth="md"
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
						sm={6}
						sx={{
							display: { xs: 'none', sm: 'block' },
						}}
					>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'flex-end',
								height: '100%',
								backgroundImage:
									"url('https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80')",
								backgroundRepeat: 'no-repeat',
								backgroundPosition: 'left top',
								backgroundSize: 'cover',
							}}
						>
							<Typography
								variant="caption"
								sx={{ fontWeight: 'medium' }}
							>
								Photo by
								<a href="https://unsplash.com/@rhondak?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
									RhondaK Native Florida Folk Artist
								</a>
								on
								<a href="https://unsplash.com/s/photos/social?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
									Unsplash
								</a>
							</Typography>
						</Box>
					</Grid>
					<Grid item xs={12} sm={6}>
						<Box sx={{ mx: 5, my: 2 }}>
							<Stack spacing={4}>
								<Box
									component="img"
									sx={{
										width: 160,
									}}
									src={logo}
									alt="logo image"
								/>
								<Typography
									variant="h4"
									sx={{
										fontSize: 32,
										letterSpacing: '0.025em',
										textDecoration: 'underline #0095F6',
									}}
								>
									Login
								</Typography>
								<Typography
									variant="h6"
									sx={{
										fontSize: 16,
										letterSpacing: '0.075rem',
									}}
								>
									Login to your account
								</Typography>
								<Typography
									variant="subtitle1"
									sx={{
										fontSize: 14,
										color: '#757575',
									}}
								>
									NetShare is a social media platform for
									connecting, sharing, and discovering with
									friends.
								</Typography>
								<LoginForm />
								<Typography
									variant="body1"
									sx={{
										textAlign: 'center',
										letterSpacing: { sm: '0.045rem' },
									}}
								>
									Don't have an account ?
									<Link
										to="/signup"
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
											Sign Up
										</Typography>
									</Link>
								</Typography>
							</Stack>
						</Box>
					</Grid>
				</Grid>
			</Container>
		</ThemeProvider>
	);
};

export default Login;

/*Photo by <a href="https://unsplash.com/@rhondak?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">RhondaK Native Florida Folk Artist</a> on <a href="https://unsplash.com/s/photos/social?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
 */
