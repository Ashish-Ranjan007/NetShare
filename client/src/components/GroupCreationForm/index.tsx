import {
	Backdrop,
	Box,
	Button,
	CircularProgress,
	Typography,
} from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { Dispatch, SetStateAction, useContext, useState } from 'react';

import AddMember from './AddMember';
import GroupInfo from './GroupInfo';
import { useAppDispatch } from '../../app/hooks';
import { uploadImage } from '../../lib/cloudinary';
import ProgressContex from '../../context/progress';
import { ProfileReference } from '../../@types/responseType';
import { addChat, setCurrentChat } from '../../features/chats/chatsSlice';
import { useCreateGroupChatMutation } from '../../features/chats/chatsApiSlice';

type props = {
	setOpen: Dispatch<SetStateAction<boolean>>;
};

type FormData = {
	users: ProfileReference[];
	name: string;
	displayPicture: File | null;
};

const GroupCreationForm = ({ setOpen }: props) => {
	const dispatch = useAppDispatch();
	const setProgress = useContext(ProgressContex);
	const [postCreateGroupChat, { isError, error }] =
		useCreateGroupChatMutation();

	const [page, setPage] = useState<0 | 1>(0);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [formData, setFormData] = useState<FormData>({
		users: [],
		name: '',
		displayPicture: null,
	});

	const handleSubmit = async () => {
		setIsSubmitting(true);

		// If display picture exist upload it to cloudinary
		let displayPictureUrl = '';
		if (formData.displayPicture) {
			const formdata = new FormData();
			formdata.append('file', formData.displayPicture);

			const result: any = await uploadImage(formdata, setProgress);
			displayPictureUrl = result.secure_url;
		}

		// Build userIds array
		const userIds = formData.users.map((user) => user.id);

		try {
			// Create group
			const returned = await postCreateGroupChat({
				name: formData.name,
				userIds: userIds,
				displayPictureUrl: displayPictureUrl || '',
			}).unwrap();

			if (returned.success) {
				dispatch(
					addChat({
						...returned.data.groupChat,
					})
				);
				dispatch(
					setCurrentChat({
						...returned.data.groupChat,
					})
				);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setOpen(false);
			setIsSubmitting(false);
		}
	};

	return (
		<Box>
			{/* Header */}
			<Typography variant="h6" textAlign="center">
				{page === 0 ? 'Add Participants' : 'Group Information'}
			</Typography>

			{/* Subtitle */}
			<Typography variant="subtitle2" textAlign="center" fontWeight="400">
				{page === 0
					? 'Select at least 2 or at most 19 participants'
					: 'You can set a display picture later'}
			</Typography>

			{/* Body */}
			{page === 0 ? (
				<AddMember formData={formData} setFormData={setFormData} />
			) : (
				<GroupInfo formData={formData} setFormData={setFormData} />
			)}

			{/* Footer */}
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: page === 0 ? 'flex-end' : 'space-between',
				}}
			>
				{page === 0 ? (
					<Button
						onClick={() => setPage(1)}
						endIcon={<ArrowForward />}
						disabled={
							formData.users.length < 2 ||
							formData.users.length > 19
								? true
								: false
						}
					>
						Next
					</Button>
				) : (
					<>
						<Button
							onClick={() => setPage(0)}
							startIcon={<ArrowBack />}
						>
							Prev
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={
								formData.name.length === 0 || isSubmitting
							}
						>
							Submit
						</Button>
					</>
				)}
			</Box>
			<Backdrop
				sx={{
					color: '#fff',
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}
				open={isSubmitting}
			>
				<CircularProgress color="inherit" />
			</Backdrop>
		</Box>
	);
};

export default GroupCreationForm;
