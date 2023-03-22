import { Avatar, CircularProgress, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import axios from 'axios';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useParams } from 'react-router-dom';
import { ProfileReference } from '../@types/responseType';
import { useAppSelector } from '../app/hooks';

import WidgetSection from '../components/WidgetSection';

const SearchResultsPage = () => {
	const { searchTerm } = useParams();
	const auth = useAppSelector((state) => state.auth);

	const [page, setPage] = useState<number>(0);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [profiles, setProfiles] = useState<ProfileReference[]>([]);

	const fetchMore = async () => {
		try {
			const result = await axios.get(
				`${import.meta.env.VITE_API_BASE_URL}/api/auth/search/`,
				{
					headers: {
						Authorization: `Bearer ${auth.accessToken}`,
					},
					params: {
						searchTerm: searchTerm,
						limitToSeven: false,
						page: page,
					},
				}
			);

			setProfiles((prev) => [...prev, ...result.data.data.results]);
			setPage((prev) => prev + 1);
			setHasMore(result.data.data.results.length > 0 ? true : false);
		} catch (error) {
			console.log(error);
			setHasMore(false);
		}
	};

	useEffect(() => {
		if (profiles.length === 0 && hasMore) {
			fetchMore();
		}
	}, []);

	return (
		<Grid container spacing={2} sx={{ paddingLeft: { sm: '16px' } }}>
			<Grid
				item
				xs={12}
				lg={8}
				sx={{
					height: 'calc(100vh - 75px)',
					overflowY: 'scroll',
					'&::-webkit-scrollbar': { display: 'none' },
					scrollbarWidth: 'none',
				}}
			>
				<Typography variant="h5">
					Searched:{' '}
					<Typography component="span" variant="h5">
						{searchTerm}
					</Typography>
				</Typography>
				<Typography variant="h5" sx={{ marginTop: '16px' }}>
					Results:
				</Typography>
				<Box sx={{ marginTop: '16px' }}>
					<InfiniteScroll
						style={{ minHeight: '100px' }}
						dataLength={profiles.length}
						next={fetchMore}
						hasMore={hasMore}
						loader={
							<Box sx={{ textAlign: 'center' }}>
								<CircularProgress />
							</Box>
						}
					>
						{profiles.map((profile) => (
							<Box
								key={profile.username}
								sx={{
									padding: '8px',
									display: 'flex',
									alignItems: 'center',
									width: '100%',
									':hover': {
										backgroundColor: '#fff',
									},
									transition: 'background 300ms ease',
									borderRadius: '4px',
								}}
							>
								<Avatar
									sx={{
										width: '32px',
										height: '32px',
										marginRight: '16px',
									}}
									src={profile.profilePic}
								/>
								<Link
									style={{ color: 'inherit' }}
									to={`/profile/${profile.username}/${profile._id}`}
								>
									<Typography
										color="inherit"
										sx={{ fontWeight: '500' }}
									>
										{profile.username}
									</Typography>
								</Link>
							</Box>
						))}
					</InfiniteScroll>
				</Box>
			</Grid>
			<Grid item xs={0} lg={4}>
				<WidgetSection />
			</Grid>
		</Grid>
	);
};

export default SearchResultsPage;
