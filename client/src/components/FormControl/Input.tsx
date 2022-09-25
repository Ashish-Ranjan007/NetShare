import { Field, FieldProps } from 'formik';
import { TextField, Stack } from '@mui/material';

const Input: React.FC = (props: any) => {
	const { label, name, error, touched, ...rest } = props;

	return (
		<Stack>
			<Field name={name}>
				{({ field, form, meta }: FieldProps) => {
					return (
						<TextField
							id={name}
							{...rest}
							{...field}
							size="small"
							label={label}
							error={error && touched ? true : false}
							helperText={error && touched ? error : ''}
						/>
					);
				}}
			</Field>
		</Stack>
	);
};

export default Input;
