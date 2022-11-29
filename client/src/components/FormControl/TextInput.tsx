import { Box, Stack } from '@mui/system';
import { ErrorMessage, Field } from 'formik';
import TextError from './TextError';

const TextInput = (props: any) => {
	const { label, name, ...rest } = props;

	return (
		<Box
			sx={{
				paddingX: '8px',
				display: 'flex',
				gap: { xs: '2px', md: '48px' },
				textAlign: { xs: 'left', md: 'right' },
				alignItems: { sx: 'flex-start', md: 'center' },
				flexDirection: { xs: 'column', md: 'row' },
			}}
		>
			<label htmlFor={name} style={{ flex: '1' }}>
				{label}
			</label>
			<Box sx={{ flex: '1' }}>
				<Field
					style={{
						width: '100%',
						padding: '8px',
					}}
					id={name}
					name={name}
					{...rest}
				/>
				<ErrorMessage name={name} component={TextError} />
			</Box>
		</Box>
	);
};

export default TextInput;
