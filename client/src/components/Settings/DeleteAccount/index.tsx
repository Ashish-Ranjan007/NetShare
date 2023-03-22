import axios from 'axios';
import * as Yup from 'yup';
import { useState } from 'react';
import { Box } from '@mui/system';
import { Form, Formik } from 'formik';
import { Button, Snackbar, Stack, Typography } from '@mui/material';

import FormControl from '../../FormControl';
import { logout } from '../../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';

type FormValues = {
	email: string;
	password: string;
};

type ResponseType = {
	success: boolean;
	data: {};
	error: string;
};

const DeleteAccount = () => {
	const dispatch = useAppDispatch();
	const [error, setError] = useState<string>('');
	const auth = useAppSelector((state) => state.auth);

	const initialValues: FormValues = {
		email: '',
		password: '',
	};

	const onSubmit = async (values: FormValues) => {
		if (values.email !== auth.email) {
			setError('Email is invalid');
			return;
		}

		try {
			await axios.delete(
				`${
					import.meta.env.VITE_API_BASE_URL
				}/api/settings/delete-account`,
				{
					headers: { Authorization: `Bearer ${auth.accessToken}` },
					data: { userId: auth._id, password: values.password },
				}
			);

			dispatch(logout());
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.data) {
					setError((error.response.data as ResponseType).error);
				} else {
					setError('An Error Occurred');
				}
			} else {
				setError('An Error Occurred');
			}
		}
	};

	const validationSchema = Yup.object({
		email: Yup.string().email('Invalid email format').required('Required'),
		password: Yup.string()
			.required('Required!')
			.min(8, 'Password cannot be less thatn 8 characters.'),
	});

	return (
		<Box sx={{ marginTop: '24px', maxWidth: '500px' }}>
			<Typography variant="h6" color="error">
				Are you sure you want to delete this account ?
			</Typography>
			<Typography sx={{ marginY: '32px' }}>
				This action cannot be undone. This will permanently delete all
				informations related to your account on our platform.
			</Typography>
			<Typography>
				Please fill-in the required informations to proceed.
			</Typography>
			<Formik
				initialValues={initialValues}
				onSubmit={onSubmit}
				validationSchema={validationSchema}
				validateOnMount
			>
				{(formik) => {
					return (
						<Form>
							<Stack spacing={4} sx={{ marginTop: '32px' }}>
								<FormControl
									control="input"
									type="email"
									name="email"
									label="Email"
									error={formik.errors.email}
									touched={formik.touched.email}
								/>
								<FormControl
									control="input"
									type="password"
									name="password"
									label="Password"
									error={formik.errors.password}
									touched={formik.touched.password}
								/>
								<Button
									type="submit"
									variant="outlined"
									color="error"
								>
									Delete This Account
								</Button>
							</Stack>
						</Form>
					);
				}}
			</Formik>
			<Snackbar
				open={error.length > 0}
				onClose={() => setError('')}
				message={error}
				autoHideDuration={3000}
			/>
		</Box>
	);
};

export default DeleteAccount;
