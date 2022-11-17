import { Grid } from '@mui/material';
import WidgetSection from '../components/WidgetSection';

const NotificationPage = () => {
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} lg={8}>
				Notifications Page
			</Grid>
			<Grid item xs={0} lg={4}>
				<WidgetSection />
			</Grid>
		</Grid>
	);
};

export default NotificationPage;
