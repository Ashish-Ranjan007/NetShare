import { forwardRef } from 'react';
import { Alert, AlertProps, Snackbar } from '@mui/material';

type Props = {
	open: boolean;
	message: string;
	handleClose: () => void;
};

const SnackbarAlert = forwardRef<HTMLDivElement, AlertProps>(
	function SnackbarAlert(props, ref) {
		return <Alert elevation={6} ref={ref} {...props} />;
	}
);

const Toast = (props: Props) => {
	return (
		<>
			<Snackbar
				open={props.open}
				autoHideDuration={6000}
				onClose={props.handleClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
			>
				<SnackbarAlert onClose={props.handleClose} severity="error">
					{props.message}
				</SnackbarAlert>
			</Snackbar>
		</>
	);
};

export default Toast;
