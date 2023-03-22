import axios from 'axios';
import * as Yup from 'yup';
import { Stack } from '@mui/system';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { ChangeEvent, useContext, useState } from 'react';
import { Avatar, Box, Button, Typography } from '@mui/material';

import FormControl from '../../FormControl';
import { uploadImage } from '../../../lib/cloudinary';
import ProgressContex from '../../../context/progress';
import { DataType } from '../../../@types/responseType';
import { setCredentials } from '../../../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';

type FormValues = {
	firstname: string;
	lastname: string;
	bio: string;
	dateOfBirth: Date | null;
	gender: 'Male' | 'Female' | 'Others' | null;
};

const dropDownOptions = [
	{ key: 'Select an option', value: null },
	{ key: 'Male', value: 'Male' },
	{ key: 'Female', value: 'Female' },
	{ key: 'Others', value: 'Others' },
];

const EditProfile = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const setProgress = useContext(ProgressContex);
	const auth = useAppSelector((state) => state.auth);
	const [image, setImage] = useState<File | null>(null);

	const initialValues = {
		firstname: auth.firstname,
		lastname: auth.lastname,
		bio: auth.bio,
		dateOfBirth: auth.dateOfBirth ? new Date(auth.dateOfBirth) : null,
		gender: auth.gender ? auth.gender : null,
	};

	const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setImage(e.target.files[0]);
		}
	};

	const onSubmit = async (values: FormValues) => {
		// if new image exists upload it to cloudinary
		let profilePic = auth.profilePic;

		if (image) {
			const formData = new FormData();
			formData.append('file', image);

			const result: any = await uploadImage(formData, setProgress);
			profilePic = result.secure_url;
		}

		try {
			// update user
			const result = await axios.post<{
				success: boolean;
				data: DataType;
				error: string;
			}>(
				`${import.meta.env.VITE_API_BASE_URL}/api/settings/profile`,
				{
					userId: auth._id,
					profilePic: profilePic,
					firstname: values.firstname,
					lastname: values.lastname,
					bio: values.bio,
					dateOfBirth: values.dateOfBirth,
					gender: values.gender,
				},
				{ headers: { Authorization: `Bearer ${auth.accessToken}` } }
			);

			if (result.data.success) {
				dispatch(
					setCredentials({
						...result.data.data.userObj,
						accessToken: auth.accessToken,
						isAuthenticated: true,
					})
				);
			}

			navigate('/');
		} catch (error) {
			console.log(error);
		}
	};

	const validationSchema = Yup.object({
		firstname: Yup.string().required(),
		lastname: Yup.string().required(),
		bio: Yup.string(),
		dateOfBirth: Yup.date().required('Required').nullable(),
		gender: Yup.string().nullable(),
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
						<Form
							role="form"
							style={{
								marginTop: '16px',
							}}
						>
							<Stack
								spacing={4}
								sx={{ width: { xs: '100%', md: '80%' } }}
							>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: { xs: '24px', md: '48px' },
									}}
								>
									<Box
										sx={{
											width: { xs: 'auto', md: '100%' },
										}}
									>
										<Avatar
											sx={{ marginLeft: 'auto' }}
											src={auth.profilePic}
										/>
									</Box>
									<Box sx={{ width: '100%' }}>
										<label
											htmlFor="profilePic"
											style={{
												textAlign: 'left',
												cursor: 'pointer',
												color: '#1976d2',
											}}
										>
											Change Profile Pic
										</label>
										{image && (
											<Typography>
												{image.name}
											</Typography>
										)}
									</Box>
									<input
										id="profilePic"
										type="file"
										accept="image/*"
										onChange={handleFileUpload}
										style={{ display: 'none' }}
									/>
								</Box>
								<FormControl
									control="textInput"
									type="text"
									label="First Name"
									name="firstname"
									error={formik.errors.firstname}
									touched={formik.touched.firstname}
								/>
								<FormControl
									control="textInput"
									type="text"
									label="Last Name"
									name="lastname"
									error={formik.errors.lastname}
									touched={formik.touched.lastname}
								/>
								<FormControl
									control="textarea"
									label="Bio"
									name="bio"
									error={formik.errors.bio}
									touched={formik.touched.bio}
								/>
								<FormControl
									control="select"
									label="Gender"
									options={dropDownOptions}
									name="gender"
									error={formik.errors.gender}
									touched={formik.touched.gender}
								/>
								<FormControl
									control="date"
									label="Date of Birth"
									name="dateOfBirth"
								/>
								<Button
									variant="contained"
									type="submit"
									disabled={
										formik.isSubmitting ||
										!formik.dirty ||
										!formik.isValid
									}
									sx={{
										width: '100px',
										alignSelf: 'flex-end',
									}}
								>
									Submit
								</Button>
							</Stack>
						</Form>
					);
				}}
			</Formik>
		</>
	);
};

export default EditProfile;
