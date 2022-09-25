import React, { ReactNode } from 'react';

type IProps = {
	children: ReactNode;
};

const TextError: React.FC<IProps> = (props: IProps) => {
	return (
		<div style={{ color: 'red', textAlign: 'center' }}>
			{props.children}
		</div>
	);
};

export default TextError;
