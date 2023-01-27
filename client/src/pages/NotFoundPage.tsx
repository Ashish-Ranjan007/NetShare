import { Box, Button, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

const NotFoundPage = () => {
	return (
		<Box
			sx={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
			}}
		>
			<Typography
				sx={{ marginBottom: '16px', textAlign: 'center' }}
				variant="h4"
			>
				404 Page Not Found
			</Typography>
			<Typography
				sx={{
					marginX: 'auto',
					textAlign: 'center',
					maxWidth: '500px',
				}}
			>
				Something went wrong. We couldn't find the page you are looking
				for. The resource may have been removed or you have entered an
				invalid URL.
			</Typography>
			<NavLink
				to="/"
				style={{ display: 'flex', justifyContent: 'center' }}
			>
				<Button
					variant="outlined"
					sx={{
						paddingX: '32px',
						marginTop: '32px',
						marginX: 'auto',
					}}
				>
					Go Home
				</Button>
			</NavLink>
		</Box>
	);
};

export default NotFoundPage;
