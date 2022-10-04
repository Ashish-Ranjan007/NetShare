import { Box } from '@mui/material';
import React from 'react';

import Signup from '../components/Auth/Signup';

const SignupPage: React.FC = () => {
	return (
		<Box
			className="bg"
			sx={{
				py: { xs: 0, sm: 4 },
				height: '100vh',
			}}
		>
			<Signup />
		</Box>
	);
};

export default SignupPage;
