import { Box } from '@mui/material';
import Birthdays from './Birthdays';
import SuggestedProfiles from './SuggestedProfiles';

const WidgetSection = () => {
	return (
		<Box sx={{ display: { xs: 'none', lg: 'block' } }}>
			<SuggestedProfiles />
			<Box sx={{ marginTop: '24px' }}>
				<Birthdays />
			</Box>
		</Box>
	);
};

export default WidgetSection;
