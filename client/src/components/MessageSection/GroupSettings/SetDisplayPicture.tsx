import {
	Avatar,
	Backdrop,
	Box,
	Button,
	CircularProgress,
	Modal,
	Typography,
} from '@mui/material';
import { ChangeEvent, useContext, useState } from 'react';

import { uploadImage } from '../../../lib/cloudinary';
import ProgressContex from '../../../context/progress';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setDisplayPicture } from '../../../features/chats/chatsSlice';
import { useSetDisplayPictureMutation } from '../../../features/chats/chatsApiSlice';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: '400px',
	bgcolor: 'background.paper',
	border: '2px solid #949494',
	boxShadow: 24,
	padding: 4,
};

const SetDisplayPicture = () => {
	const dispatch = useAppDispatch();
	const setProgress = useContext(ProgressContex);
	const auth = useAppSelector((state) => state.auth);
	const [postSetDisplayPicture] = useSetDisplayPictureMutation();
	const chat = useAppSelector((state) => state.chats.currentChat);

	const [openModal, setOpenModal] = useState<boolean>(false);
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [selectedImage, setSelectedImage] = useState<File | null>(null);

	const isAdmin = (userId: string): boolean => {
		if (!chat) {
			return false;
		}

		return chat.admins.find((admin) => admin._id === userId) ? true : false;
	};

	const onImageSelection = (e: ChangeEvent<HTMLInputElement>) => {
		const files = (e.target as HTMLInputElement).files;

		if (files && files.length > 0) {
			setSelectedImage(files[0]);
		}
	};

	const handleSubmit = async () => {
		if (!chat || !selectedImage) {
			setOpenModal(false);
			return;
		}

		setOpenBackdrop(true);

		try {
			// If display picture exist upload it to cloudinary
			let displayPictureUrl = '';
			if (selectedImage) {
				const formdata = new FormData();
				formdata.append('file', selectedImage);

				const result: any = await uploadImage(formdata, setProgress);
				displayPictureUrl = result.secure_url;
			}

			const returned = await postSetDisplayPicture({
				chatId: chat._id,
				displayPictureUrl: displayPictureUrl,
			}).unwrap();

			console.log(returned);

			if (returned.success) {
				dispatch(
					setDisplayPicture({
						chatId: chat._id,
						displayPictureUrl: displayPictureUrl,
					})
				);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setOpenBackdrop(false);
			setOpenModal(false);
		}
	};

	return (
		<Box>
			<Avatar
				src={chat?.displayPicture}
				sx={{
					width: '128px',
					height: '128px',
					cursor: 'pointer',
					marginX: 'auto',
				}}
				onClick={() => {
					if (!isAdmin(auth._id)) {
						return;
					}
					setOpenModal(true);
				}}
			/>

			<Modal open={openModal} onClose={() => setOpenModal(false)}>
				<Box sx={style}>
					<Typography variant="h6" textAlign="center">
						Set Display Picture
					</Typography>

					<label
						htmlFor="profilePic"
						style={{
							textAlign: 'left',
							cursor: 'pointer',
							color: '#1976d2',
						}}
					>
						<Avatar
							src={
								selectedImage
									? URL.createObjectURL(selectedImage)
									: chat?.displayPicture
							}
							sx={{
								width: '128px',
								height: '128px',
								margin: '32px auto 16px auto',
							}}
						/>
					</label>
					<input
						id="profilePic"
						type="file"
						accept="image/*"
						style={{ display: 'none' }}
						onChange={(e) => onImageSelection(e)}
					/>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Button onClick={() => setOpenModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleSubmit}>Submit</Button>
					</Box>
				</Box>
			</Modal>
			<Backdrop open={openBackdrop}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</Box>
	);
};

export default SetDisplayPicture;
