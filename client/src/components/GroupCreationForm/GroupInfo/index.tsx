import {
	ChangeEvent,
	Dispatch,
	SetStateAction,
	useEffect,
	useState,
} from 'react';
import { Avatar, Box, TextField } from '@mui/material';
import { ProfileReference } from '../../../@types/responseType';

type FormData = {
	users: ProfileReference[];
	name: string;
	displayPicture: File | null;
};

type props = {
	formData: FormData;
	setFormData: Dispatch<SetStateAction<FormData>>;
};

const GroupInfo = ({ formData, setFormData }: props) => {
	const [name, setName] = useState(formData.name);
	const [selectedImage, setSelectedImage] = useState<File | null>(
		formData.displayPicture
	);

	const onImageSelection = (e: ChangeEvent<HTMLInputElement>) => {
		const files = (e.target as HTMLInputElement).files;

		if (files && files.length > 0) {
			setSelectedImage(files[0]);
		}
	};

	useEffect(() => {
		setFormData((prev) => ({
			users: prev.users,
			name: name,
			displayPicture: selectedImage,
		}));
	}, [name, selectedImage]);

	return (
		<Box sx={{ paddingY: '16px' }}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					paddingY: '12px',
				}}
			>
				<Avatar
					sx={{ height: '56px', width: '56px' }}
					src={
						selectedImage ? URL.createObjectURL(selectedImage) : ''
					}
				/>
				<label
					htmlFor="profilePic"
					style={{
						textAlign: 'left',
						cursor: 'pointer',
						color: '#1976d2',
					}}
				>
					Set a display picture for the group
				</label>
				<input
					id="profilePic"
					type="file"
					accept="image/*"
					style={{ display: 'none' }}
					onChange={(e) => onImageSelection(e)}
				/>
			</Box>

			<TextField
				variant="outlined"
				size="small"
				label="Group Name"
				sx={{ marginTop: '16px' }}
				required
				value={name}
				onChange={(e) => setName(e.target.value)}
			/>
		</Box>
	);
};

export default GroupInfo;
