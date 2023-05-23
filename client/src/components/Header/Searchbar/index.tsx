import {
	Avatar,
	Box,
	InputAdornment,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	TextField,
} from '@mui/material';
import axios from 'axios';
import { FiSearch } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setRecentSearches } from '../../../features/auth/authSlice';

type Props = {
	mobile?: boolean;
};

type Profile = {
	_id: string;
	profilePic: string;
	username: string;
};

const Searchbar = ({ mobile = false }: Props) => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const auth = useAppSelector((state) => state.auth);

	const [show, setShow] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [queryProfiles, setQueryProfiles] = useState<Profile[]>([]);

	/*
        If searchbar is not empty and user has not typed for 1 second, a request is made
        to get a maximum of 7 users who have searchTerm in their firstname, lastname or username.
    */
	useEffect(() => {
		if (searchTerm.length === 0 && show) {
			setShow(false);
		}

		if (searchTerm.length > 0) {
			const timeOutId = setTimeout(() => {
				(async () => {
					const fetchedData = await axios.get(
						`${import.meta.env.VITE_API_BASE_URL}/api/auth/search/`,
						{
							headers: {
								Authorization: `Bearer ${auth.accessToken}`,
							},
							params: {
								searchTerm: searchTerm,
								limitToSeven: true,
							},
						}
					);

					const results = fetchedData.data.data.results.map(
						(result: any) => {
							return {
								profilePic: result.profilePic,
								id: result._id,
								username: result.username,
							};
						}
					);

					setQueryProfiles(results);
				})();
			}, 500);

			return () => clearTimeout(timeOutId);
		}
	}, [searchTerm]);

	// Dropdown menu is shown when searchbar is focused
	const handleFocus = () => {
		setShow(true);

		if (searchTerm.length === 0) {
			setQueryProfiles(auth.recentSearches);
		}
	};

	// Dropdown is closed when searchbar is blurred
	const handleBlur = () => {
		setShow(false);

		if (searchTerm.length === 0) {
			setQueryProfiles([]);
		}
	};

	// mouseDown instead of click because blur event is fired before click
	// which closes the dropdown so click event is not fired
	const handleMouseDown = async (
		id: string,
		username: string,
		profilePic: string
	) => {
		// add clicked user to recentSearches in database and then redirect to clicked user's profile

		await axios.post(
			`${import.meta.env.VITE_API_BASE_URL}/api/auth/add-recent-search`,
			{
				userId: id,
			},
			{
				headers: {
					Authorization: `Bearer ${auth.accessToken}`,
				},
			}
		);

		// Reset searchTerm
		setSearchTerm('');

		// Check if user already exists in recentSearches state
		let found = false;
		for (let i = 0; i < auth.recentSearches.length; i++) {
			if (auth.recentSearches[i]._id === id) {
				found = true;
				break;
			}
		}

		// if not push it into recentSearches state
		if (!found) {
			dispatch(
				setRecentSearches({
					_id: id,
					username: username,
					profilePic: profilePic,
				})
			);
		}

		navigate(`/profile/${username}/${id}`);
	};

	// Dropdown also closes on submit
	const handleSubmit = (e: any) => {
		e.preventDefault();

		// navigate to search page on submit
		if (searchTerm.length > 0) {
			setSearchTerm('');
			setShow(false);
			navigate(`/search/${searchTerm}`);
		}
	};

	return (
		<>
			<Box
				sx={{
					width: '100%',
					display: 'flex',
					justifyContent: { xs: 'center', md: 'start' },
					position: 'relative',
				}}
				role="form"
				component="form"
				onSubmit={handleSubmit}
			>
				<TextField
					sx={{
						width: mobile
							? '100%'
							: {
									xs: '70%',
									sm: '90%',
									md: '100%',
							  },
						maxWidth: '600px',
						marginBottom: '8px',
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FiSearch size={24} />
							</InputAdornment>
						),
					}}
					inputProps={{
						'data-testid': 'searchbar',
					}}
					id="searchbar"
					name="searchbar"
					role="textbox"
					size="small"
					variant="outlined"
					autoComplete="off"
					placeholder="Search people..."
					value={searchTerm}
					onBlur={handleBlur}
					onFocus={handleFocus}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</Box>

			<Box
				sx={{
					width: mobile
						? '100%'
						: {
								xs: '70%',
								sm: '90%',
								md: '100%',
						  },
					maxWidth: '600px',
					background: 'white',
					boxShadow:
						'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
					position: 'absolute',
					opacity: show ? 1 : 0,
					visibility: show ? 'visible' : 'hidden',
					transition: 'visibility 300ms ease, opacity 300ms ease',
					zIndex: '999',
				}}
			>
				<List
					sx={{
						padding: '0px',
					}}
				>
					{queryProfiles.map((result) => (
						<ListItem sx={{ padding: '0px' }} key={result._id}>
							<Link
								to={`/profile/${result.username}/${result._id}`}
								style={{
									width: '100%',
									display: 'block',
									textDecoration: 'none',
									color: 'inherit',
								}}
							>
								<ListItemButton
									sx={{ padding: '8px 8px' }}
									onMouseDown={() =>
										handleMouseDown(
											result._id,
											result.username,
											result.profilePic
										)
									}
								>
									<ListItemIcon>
										<Avatar
											sx={{
												width: '32px',
												height: '32px',
											}}
											src={result.profilePic}
										/>
									</ListItemIcon>
									<ListItemText primary={result.username} />
								</ListItemButton>
							</Link>
						</ListItem>
					))}
				</List>
			</Box>
		</>
	);
};

export default Searchbar;
