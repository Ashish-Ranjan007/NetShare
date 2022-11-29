import { Box } from '@mui/material';
import DateView from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ErrorMessage, Field, FieldInputProps, FormikProps } from 'formik';

import TextError from './TextError';

interface FieldProps<V = any> {
	form: FormikProps<V>;
	field: FieldInputProps<V>;
}

const Date = (props: any) => {
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
				<Field name={name}>
					{({ form, field }: FieldProps) => {
						const { setFieldValue } = form;
						const { value } = field;

						return (
							<DateView
								id={name}
								{...field}
								{...rest}
								style={{ width: '100%' }}
								dateFormat="dd/MM/yyyy"
								selected={value ? new window.Date(value) : null}
								onChange={(val) => setFieldValue(name, val)}
							/>
						);
					}}
				</Field>
				<ErrorMessage name={name} component={TextError} />
			</Box>
		</Box>
	);
};

export default Date;
