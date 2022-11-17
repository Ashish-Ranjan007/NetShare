import axios from 'axios';
import { Dispatch, SetStateAction } from 'react';

export const uploadImage = (
	formData: FormData,
	setProgress: Dispatch<SetStateAction<number>> | null
) => {
	return new Promise((resolve, reject) => {
		formData.append(
			'upload_preset',
			import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
		);

		axios
			.post(
				`https://api.cloudinary.com/v1_1/${
					import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
				}/image/upload`,
				formData,
				{
					onUploadProgress: (progressEvent) => {
						const { loaded, total } = progressEvent;
						let percent = Math.floor((loaded * 100) / total);

						if (setProgress) setProgress(percent);
					},
				}
			)
			.then((result) => resolve(result.data))
			.catch((error) => reject(error));
	});
};
