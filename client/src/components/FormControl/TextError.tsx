import React, { ReactNode } from 'react';

const TextError = (props: any) => {
	return (
		<div style={{ color: 'red', textAlign: 'left' }}>{props.children}</div>
	);
};

export default TextError;
