import { Box, Stack } from '@mui/system';
import { ErrorMessage, Field } from 'formik';
import React from 'react';

import TextError from './TextError';

const Textarea = (props: any) => {
	const { label, name, ...rest } = props;

	const handleAutoResize = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.target.style.height = 'auto';
		let scHeight = e.target.scrollHeight;
		e.target.style.height = `${scHeight}px`;
	};

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
						resize: 'none',
						scroll: 'none',
						maxHeight: '330px',
						overflowX: 'hidden',
					}}
					as="textarea"
					id={name}
					name={name}
					{...rest}
					onKeyUp={handleAutoResize}
				/>
				<ErrorMessage name={name} component={TextError} />
			</Box>
		</Box>
	);
};

export default Textarea;
