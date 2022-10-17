import * as Yup from 'yup';
import { useState } from 'react';
import { Formik, Form } from 'formik';
import { Stack, Button, createTheme, ThemeProvider } from '@mui/material';

import Toast from '../../../Toast/Toast';
import FormControl from '../../../FormControl';
import { useAppDispatch } from '../../../../app/hooks';
import { setCredentials } from '../../../../features/auth/authSlice';
import { useLoginMutation } from '../../../../features/auth/authApiSlice';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
	palette: {
		primary: {
			main: '#0095F6',
		},
	},
});

type Values = {
	email: string;
	password: string;
};

const LoginForm = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [login, { isLoading }] = useLoginMutation();
	const [loginError, setLoginError] = useState('');

	const initialValues = {
		email: '',
		password: '',
	};

	const onSubmit = async (values: Values) => {
		try {
			const returned: any = await login({
				email: values.email,
				password: values.password,
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
			setLoginError(error.data.error);
		}
	};

	const validationSchema = Yup.object({
		email: Yup.string().email('Invalid Email Format').required('Required!'),
		password: Yup.string()
			.min(8, 'Password must have atleast 8 characters')
			.required('Required!'),
	});

	return (
		<>
			<Formik
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={onSubmit}
				validateOnMount
			>
				{(formik) => {
					return (
						<Form role="form">
							<Stack spacing={3}>
								<FormControl
									control="input"
									type="email"
									label="Email"
									name="email"
									error={formik.errors.email}
									touched={formik.touched.email}
								/>

								<FormControl
									control="password"
									type="password"
									label="Password"
									name="password"
									error={formik.errors.password}
									touched={formik.touched.password}
								/>

								<ThemeProvider theme={theme}>
									<Button
										sx={{
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
				open={!!loginError}
				message={loginError}
				handleClose={() => setLoginError('')}
			/>
		</>
	);
};

export default LoginForm;
