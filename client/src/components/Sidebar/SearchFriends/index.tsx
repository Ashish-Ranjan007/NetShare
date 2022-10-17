import { InputAdornment, TextField } from '@mui/material';
import React from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchFriends = () => {
	return (
		<>
			<form>
				<TextField
					sx={{ paddingLeft: '8px' }}
					size="small"
					variant="outlined"
					placeholder="Search Friends..."
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FiSearch />
							</InputAdornment>
						),
					}}
				/>
			</form>
		</>
	);
};

export default SearchFriends;
