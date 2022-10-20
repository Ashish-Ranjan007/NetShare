import { InputAdornment, TextField } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { FiSearch } from 'react-icons/fi';

type Props = {
	setSearchTerm: Dispatch<SetStateAction<string>>;
};

const SearchBar = ({ setSearchTerm }: Props) => {
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
					inputProps={{
						'data-testid': 'friends-searchbar',
					}}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</form>
		</>
	);
};

export default SearchBar;
