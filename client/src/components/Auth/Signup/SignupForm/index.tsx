import * as Yup from 'yup';
import { useState } from 'react';
import { Form, Formik } from 'formik';
import { Button, createTheme, Stack, ThemeProvider } from '@mui/material';

import Toast from '../../../Toast/Toast';
import FormControl from '../../../FormControl';
import { useAppDispatch } from '../../../../app/hooks';
import { setCredentials } from '../../../../features/auth/authSlice';
import { useRegisterMutation } from '../../../../features/auth/authApiSlice';
import { useNavigate } from 'react-router-dom';

interface Values {
	firstname: string;
	lastname: string;
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

const theme = createTheme({
	palette: {
		primary: {
			main: '#0095F6',
		},
	},
});

const SignupForm = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [signupError, setSignupError] = useState('');
	const [register, { isLoading }] = useRegisterMutation();

	const initialValues = {
		firstname: '',
		lastname: '',
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	};

	const onSubmit = async (values: Values) => {
		try {
			const returned = await register({
				email: values.email,
				username: values.username,
				firstname: values.firstname,
				lastname: values.lastname,
				password: values.password,
				confirmPassword: values.confirmPassword,
			}).unwrap();

			dispatch(
				setCredentials({
					email: returned.data.userObj.email,
					username: returned.data.userObj.username,
					profilePic: returned.data.userObj.profilePic,
					recentSearches: returned.data.userObj.recentSearches,
					accessToken: returned.token,
					isAuthenticated: true,
				})
			);

			navigate('/feed');
		} catch (error: any) {
			console.log(error);
			setSignupError(error.data.error);
		}
	};

	const validationSchema = Yup.object({
		firstname: Yup.string().required('Required!'),
		lastname: Yup.string().required('Required!'),
		username: Yup.string().required('Required'),
		email: Yup.string().email('Invalid email format').required('Required!'),
		password: Yup.string()
			.min(8, 'Password must have atleast 8 characters')
			.required('Required!'),
		confirmPassword: Yup.string()
			.oneOf([Yup.ref('password'), ''], 'Passwords must match')
			.required('Required!'),
	});

	return (
		<>
			<Formik
				initialValues={initialValues}
				onSubmit={onSubmit}
				validationSchema={validationSchema}
				validateOnMount
			>
				{(formik) => {
					return (
						<Form role="form">
							<Stack spacing={4}>
								<Stack
									spacing={4}
									direction={{ xs: 'column', sm: 'row' }}
								>
									<FormControl
										control="input"
										type="text"
										label="First Name"
										name="firstname"
										error={formik.errors.firstname}
										touched={formik.touched.firstname}
									/>
									<FormControl
										control="input"
										type="text"
										label="Last Name"
										name="lastname"
										error={formik.errors.lastname}
										touched={formik.touched.lastname}
									/>
								</Stack>
								<Stack
									spacing={4}
									direction={{ xs: 'column', sm: 'row' }}
								>
									<FormControl
										control="input"
										type="text"
										label="Username"
										name="username"
										error={formik.errors.username}
										touched={formik.touched.username}
									/>
									<FormControl
										control="input"
										type="email"
										label="Email"
										name="email"
										error={formik.errors.email}
										touched={formik.touched.email}
									/>
								</Stack>
								<Stack
									spacing={4}
									direction={{ xs: 'column', sm: 'row' }}
								>
									<FormControl
										control="input"
										type="password"
										label="Password"
										name="password"
										error={formik.errors.password}
										touched={formik.touched.password}
									/>
									<FormControl
										control="input"
										type="password"
										label="Confirm Password"
										name="confirmPassword"
										error={formik.errors.confirmPassword}
										touched={formik.touched.confirmPassword}
									/>
								</Stack>

								<ThemeProvider theme={theme}>
									<Button
										sx={{
											width: 128,
											bgcolor: 'primary.main',
										}}
										variant="contained"
										type="submit"
										disabled={
											!formik.isValid ||
											formik.isSubmitting
										}
									>
										Submit
									</Button>
								</ThemeProvider>
							</Stack>
						</Form>
					);
				}}
			</Formik>

			<Toast
				open={!!signupError}
				message={signupError}
				handleClose={() => setSignupError('')}
			/>
		</>
	);
};

export default SignupForm;
