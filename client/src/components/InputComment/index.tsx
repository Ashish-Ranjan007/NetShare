import { Box } from '@mui/system';
import { Send } from '@mui/icons-material';
import { Dispatch, FormEvent, SetStateAction } from 'react';
import { Avatar, IconButton, InputAdornment, TextField } from '@mui/material';

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
			<Avatar
				sx={{
					width: '32px',
					height: '32px',
					marginRight: '16px',
				}}
				src={profilePic}
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
