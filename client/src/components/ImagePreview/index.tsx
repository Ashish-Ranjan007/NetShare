import { Box } from '@mui/system';

const ImagePreview = ({ children }: { children: JSX.Element[] }) => {
	return (
		<Box
			sx={{
				width: '100%',
				minHeight: '150px',
				maxHeight: '200px',
				padding: '8px 0px',
				whiteSpace: 'nowrap',
				borderRadius: '16px',
				border: '2px dotted gray',
				overflowX: 'auto',

				/* ===== Scrollbar ===== */
				/* Firefox */
				scrollbarWidth: 'thin',
				scrollbarColor: '#077adb transparent',

				/* Chrome, Edge, and Safari */
				'::-webkit-scrollbar': {
					height: '15px',
				},
				'::-webkit-scrollbar-track': {
					background: 'transparent',
					width: '24px',
				},
				'::-webkit-scrollbar-thumb': {
					borderRadius: '16px',
					backgroundColor: '#077adb',
					border: '3px solid transparent',
					backgroundClip: 'padding-box',
				},
			}}
		>
			{children}
		</Box>
	);
};

export default ImagePreview;
