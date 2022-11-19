import {
	EmailIcon,
	EmailShareButton,
	FacebookIcon,
	FacebookShareButton,
	InstapaperIcon,
	InstapaperShareButton,
	LinkedinIcon,
	LinkedinShareButton,
	RedditIcon,
	RedditShareButton,
	TelegramIcon,
	TelegramShareButton,
	TwitterIcon,
	TwitterShareButton,
} from 'react-share';
import { Box } from '@mui/system';
import { Button, Modal, Snackbar, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';

const ShareOptionsModal = ({
	url,
	open,
	onClose,
}: {
	url: string;
	open: boolean;
	onClose: Dispatch<SetStateAction<boolean>>;
}) => {
	const [openAlert, setOpenAlert] = useState<boolean>(false);

	return (
		<Box>
			<Modal
				open={open}
				onClose={onClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box
					sx={{
						position: 'absolute' as 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						bgcolor: 'background.paper',
						boxShadow: 24,
						maxWidth: '500px',
						padding: '16px',
						borderRadius: '5px',
						border: 'transparent',
					}}
				>
					<Box
						sx={{
							overflowX: 'auto',
							whiteSpace: 'nowrap',

							/* ===== Scrollbar ===== */
							/* Firefox */
							scrollbarWidth: 'thin',
							scrollbarColor: '#077adb transparent',

							/* Chrome, Edge, and Safari */
							'::-webkit-scrollbar': {
								height: '14px',
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
						<EmailShareButton url={url} style={{ padding: '8px' }}>
							<EmailIcon size="64px" round />
							<Typography>Email</Typography>
						</EmailShareButton>

						<FacebookShareButton
							url={location.href}
							quote="Github"
							style={{ padding: '8px' }}
						>
							<FacebookIcon size="64px" round />
							<Typography>Facebook</Typography>
						</FacebookShareButton>

						<InstapaperShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<InstapaperIcon size="64px" round />
							<Typography>Instagram</Typography>
						</InstapaperShareButton>

						<LinkedinShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<LinkedinIcon size="64px" round />
							<Typography>LinkedIn</Typography>
						</LinkedinShareButton>

						<RedditShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<RedditIcon size="64px" round />
							<Typography>Reddit</Typography>
						</RedditShareButton>

						<TelegramShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<TelegramIcon size="64px" round />
							<Typography>Telegram</Typography>
						</TelegramShareButton>

						<TwitterShareButton
							url={location.href}
							style={{ padding: '8px' }}
						>
							<TwitterIcon size="64px" round />
							<Typography>Twitter</Typography>
						</TwitterShareButton>
					</Box>
					<Box
						sx={{
							width: '100%',
							display: 'flex',
							padding: '8px',
							borderRadius: '8px',
							background: '#eeeeee',
							marginTop: '24px',
						}}
					>
						<input
							style={{
								width: '100%',
								background: 'none',
								border: 'none',
								outline: 'none',
								fontSize: '15px',
								letterSpacing: '0.015rem',
							}}
							value={url}
							readOnly
						/>
						<Button
							variant="contained"
							onClick={() => {
								navigator.clipboard.writeText(url);
								setOpenAlert(true);
							}}
						>
							Copy
						</Button>
					</Box>
				</Box>
			</Modal>

			<Snackbar
				open={openAlert}
				autoHideDuration={3000}
				onClose={() => setOpenAlert(false)}
				message="Link copied to clipboard"
			/>
		</Box>
	);
};

export default ShareOptionsModal;
