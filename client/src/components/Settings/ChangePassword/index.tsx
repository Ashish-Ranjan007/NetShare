import axios from 'axios';
import * as Yup from 'yup';
import { useState } from 'react';
import { Form, Formik } from 'formik';
import FormControl from '../../FormControl';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Snackbar, Stack } from '@mui/material';

import { useAppSelector } from '../../../app/hooks';

type FormValues = {
	oldPassword: string;
	newPassword: string;
	confirmNewPassword: string;
};

type ResponseType = {
	success: boolean;
	data: {};
	error: string;
};

const ChangePassword = () => {
	const navigate = useNavigate();
	const auth = useAppSelector((state) => state.auth);

	const [error, setError] = useState<string>('');
	const [open, setOpen] = useState<boolean>(false);

	const initialValues: FormValues = {
		oldPassword: '',
		newPassword: '',
		confirmNewPassword: '',
	};

	const onSubmit = async (values: FormValues) => {
		try {
			await axios.post<ResponseType>(
				`${
					import.meta.env.VITE_API_BASE_URL
				}/api/settings/change-password`,
				{
					userId: auth._id,
					oldPassword: values.oldPassword,
					newPassword: values.newPassword,
					confirmNewPassword: values.confirmNewPassword,
				},
				{ headers: { Authorization: `Bearer ${auth.accessToken}` } }
			);

			navigate('/');
		} catch (error) {
			console.log(error);

			if (axios.isAxiosError(error)) {
				if (error.response?.data) {
					setError((error.response.data as ResponseType).error);
				} else {
					setError('An Error Occurred');
				}
			} else {
				setError('An Error Occurred');
			}

			setOpen(true);
		}
	};

	const validationSchema = Yup.object({
		oldPassword: Yup.string()
			.min(8, 'Password must have atleast 8 characters')
			.required('Required!'),
		newPassword: Yup.string()
			.min(8, 'Password must have atleast 8 characters')
			.required('Required!'),
		confirmNewPassword: Yup.string()
			.oneOf([Yup.ref('newPassword'), ''], 'Passwords must match')
			.required('Required!'),
	});

	return (
		<Box sx={{ marginTop: '24px' }}>
			<Formik
				initialValues={initialValues}
				onSubmit={onSubmit}
				validationSchema={validationSchema}
				validateOnMount
			>
				{(formik) => {
					return (
						<Form role="form">
							<Stack
								spacing={4}
								sx={{ width: { xs: '100%', md: '80%' } }}
							>
								<FormControl
									control="textInput"
									type="password"
									label="Old Password"
									name="oldPassword"
									error={formik.errors.oldPassword}
									touched={formik.touched.oldPassword}
								/>
								<FormControl
									control="textInput"
									type="password"
									label="New Password"
									name="newPassword"
									error={formik.errors.newPassword}
									touched={formik.touched.newPassword}
								/>
								<FormControl
									control="textInput"
									type="password"
									label="Confirm New Password"
									name="confirmNewPassword"
									error={formik.errors.confirmNewPassword}
									touched={formik.touched.confirmNewPassword}
								/>
								<Button
									type="submit"
									variant="contained"
									sx={{
										width: '100px',
										alignSelf: 'flex-end',
									}}
									disabled={
										formik.isSubmitting || !formik.isValid
									}
								>
									Submit
								</Button>
							</Stack>
						</Form>
					);
				}}
			</Formik>
			<Snackbar
				open={open}
				onClose={() => setOpen(false)}
				autoHideDuration={3000}
				message={error}
			/>
		</Box>
	);
};

export default ChangePassword;
