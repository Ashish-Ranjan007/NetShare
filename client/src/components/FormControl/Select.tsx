import { Box } from '@mui/material';
import { ErrorMessage, Field } from 'formik';
import TextError from './TextError';

const Select = (props: any) => {
	const { label, name, options, ...rest } = props;
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
					style={{ width: '100%', padding: '10px' }}
					as="select"
					id={name}
					name={name}
					{...rest}
				>
					{options.map((option: { key: string; value: string }) => {
						return (
							<option key={option.value} value={option.value}>
								{option.key}
							</option>
						);
					})}
				</Field>
				<ErrorMessage name={name} component={TextError} />
			</Box>
		</Box>
	);
};

export default Select;
