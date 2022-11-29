import React, { ReactNode } from 'react';

const TextError = (props: any) => {
	return (
		<div style={{ color: 'red', textAlign: 'center' }}>
			{props.children}
		</div>
	);
};

export default TextError;
