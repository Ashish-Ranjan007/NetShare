import { Box } from '@mui/material';
import Login from '../components/Auth/Login';

const LoginPage: React.FC = () => {
	return (
		<Box
			className="bg"
			sx={{
				py: { xs: 0, sm: 4 },
				height: '100vh',
			}}
		>
			<Login />
		</Box>
	);
};

export default LoginPage;
