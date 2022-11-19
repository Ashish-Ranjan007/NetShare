import { Grid } from '@mui/material';

import FeedSection from '../components/FeedSection';
import WidgetSection from '../components/WidgetSection';

const FeedPage = () => {
	return (
		<Grid container spacing={2}>
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
				<FeedSection />
			</Grid>
			<Grid item xs={0} lg={4}>
				<WidgetSection />
			</Grid>
		</Grid>
	);
};

export default FeedPage;
