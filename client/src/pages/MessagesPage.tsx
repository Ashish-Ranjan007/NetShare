import { Grid } from '@mui/material';
import { useAppSelector } from '../app/hooks';

import Chats from '../components/Chats';
import MessageSection from '../components/MessageSection';

const customScrollbar = {
	/* width */
	'::-webkit-scrollbar': {
		width: '8px',
	},

	/* Track */
	'::-webkit-scrollbar-track': {
		background: '#f1f1f1',
	},

	/* Handle */
	'::-webkit-scrollbar-thumb': {
		background: '#888',
	},

	/* Handle on hover */
	'::-webkit-scrollbar-thumb:hover': {
		background: '#555',
	},
};

const MessagesPage = () => {
	const currentChat = useAppSelector((state) => state.chats.currentChat);

	return (
		<Grid container>
			<Grid
				item
				xs={12}
				lg={4}
				sx={{
					height: 'calc(100vh - 80px)',
					overflowY: 'scroll',
					display: {
						xs: currentChat ? 'none' : 'block',
						lg: 'block',
					},
					...customScrollbar,
				}}
				id="scrollable-chat-list"
			>
				<Chats />
			</Grid>
			<Grid
				item
				lg={8}
				xs={12}
				sx={{
					height: {
						xs: 'calc(100vh - 122px)',
						sm: 'calc(100vh - 80px)',
					},
					display: {
						xs: currentChat ? 'block' : 'none',
						lg: 'block',
					},
				}}
			>
				<MessageSection />
			</Grid>
		</Grid>
	);
};

export default MessagesPage;
