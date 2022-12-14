import { InputAdornment, TextField } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import { FiSearch } from 'react-icons/fi';

type Props = {
	setSearchTerm: Dispatch<SetStateAction<string>>;
};

const SearchFriends = ({ setSearchTerm }: Props) => {
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
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</form>
		</>
	);
};

export default SearchFriends;
