import { Box } from '@mui/system';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Dispatch, FormEvent, SetStateAction } from 'react';
import { Send } from '@mui/icons-material';

const defaultProfilePic =
	'https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80';

const InputComment = ({
	open,
	profilePic,
	value,
	setValue,
	handleSubmit,
}: {
	open: boolean;
	profilePic: string;
	value: string;
	setValue: Dispatch<SetStateAction<string>>;
	handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) => {
	return (
		<Box sx={{ display: open ? 'flex' : 'none', paddingY: '8px' }}>
			<Box
				sx={{
					width: '32px',
					height: '32px',
					borderRadius: '100%',
					marginRight: '16px',
				}}
				component="img"
				src={profilePic.length > 0 ? profilePic : defaultProfilePic}
			/>
			<form style={{ width: '100%' }} onSubmit={handleSubmit}>
				<TextField
					value={value}
					onChange={(e) => setValue(e.target.value)}
					sx={{ width: '100%' }}
					id="input-with-sx"
					variant="standard"
					placeholder="Reply"
					InputProps={{
						endAdornment: (
							<InputAdornment position="start">
								<IconButton type="submit">
									<Send />
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
			</form>
		</Box>
	);
};

export default InputComment;
