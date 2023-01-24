import { Cancel } from '@mui/icons-material';
import { FileRejection, useDropzone } from 'react-dropzone';
import { FormEvent, useCallback, useContext, useState } from 'react';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';

import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../lib/cloudinary';
import ProgressContex from '../context/progress';
import ImagePreview from '../components/ImagePreview';
import WidgetSection from '../components/WidgetSection';
import { useCreatePostMutation } from '../features/post/postApiSlice';

const CreatePage = () => {
	const navigate = useNavigate();
	const [createPost] = useCreatePostMutation();
	const setProgress = useContext(ProgressContex);
	const [caption, setCaption] = useState<string>('');
	const [images, setImages] = useState<string[]>([]);
	const [isDisabled, setIsDisabled] = useState<boolean>(false);

	const onDrop = useCallback(
		(acceptedFiles: Blob[], rejectFiles: FileRejection[]) => {
			const reader = new FileReader();

			acceptedFiles.forEach((file: any) => {
				reader.onload = () => {
					setImages((prevState: any) => [
						...prevState,
						reader.result,
					]);
				};

				reader.readAsDataURL(file);
			});
		},
		[]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { 'image/*': [] },
	});

	const handleClick = (index: number) => {
		setImages((prevState) => {
			const result: string[] = [];

			prevState.forEach((image, idx) => {
				if (idx !== index) {
					result.push(image);
				}
			});

			return result;
		});
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsDisabled(true);

		const formData = new FormData();
		const contents: { public_id: string; secure_url: string }[] = [];

		// Upload images to cloudinary
		for (const image of images) {
			formData.append('file', image);

			const result: any = await uploadImage(formData, setProgress);

			contents.push({
				public_id: result.public_id,
				secure_url: result.secure_url,
			});
		}

		// create post
		const { data } = await createPost({ contents, caption }).unwrap();

		setIsDisabled(false);

		// redirect to new post
		navigate(`/post/${data.postId}`);
	};

	return (
		<Grid container spacing={2} sx={{ paddingLeft: { sm: '16px' } }}>
			<Grid item xs={12} lg={8}>
				<Box
					component="form"
					encType="multipart/form-data"
					onSubmit={(e) => handleSubmit(e)}
					sx={{
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Box
						role="presentation"
						sx={{
							flex: '1',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							padding: '24px',
							borderRadius: '2px',
							border: '2px dashed #eeeeee',
							bgcolor: '#fafafa',
							color: '#bdbdbd',
							outline: 'none',
							transition: 'border .24s ease-in-out',
						}}
						{...getRootProps()}
					>
						<input name="images" {...getInputProps()} />
						{isDragActive
							? 'Drag Active'
							: 'You can drop your files here'}
					</Box>

					<Typography variant="h6" sx={{ marginTop: '24px' }}>
						Previews
					</Typography>

					<ImagePreview>
						{images.map((image, index) => (
							<Box
								key={index}
								sx={{
									position: 'relative',
									display: 'inline-block',
									width: { xs: '100px', md: '200px' },
									margin: '0px 8px',
								}}
							>
								<Cancel
									sx={{
										cursor: 'pointer',
										marginLeft: {
											xs: '102px',
											md: '202px',
										},
										position: 'absolute',
										':hover': {
											color: 'red',
											transform: 'scale(90%)',
											transition:
												'color transform 300ms ease',
										},
									}}
									onClick={() => handleClick(index)}
								/>
								<Box
									sx={{
										width: '100%',
										objectFit: 'cover',
										margin: '16px',
										backgroundColor: 'antiquewhite',
									}}
									component="img"
									src={image}
									key={index}
								/>
							</Box>
						))}
					</ImagePreview>

					<TextField
						sx={{ margin: '32px 0px 16px 0px' }}
						multiline
						id="caption"
						name="caption"
						label="Caption"
						variant="outlined"
						value={caption}
						onChange={(e) => setCaption(e.target.value)}
					/>

					<Button
						type="submit"
						variant="contained"
						disabled={isDisabled}
					>
						Submit
					</Button>
				</Box>
			</Grid>
			<Grid item xs={0} lg={4}>
				<WidgetSection />
			</Grid>
		</Grid>
	);
};

export default CreatePage;
