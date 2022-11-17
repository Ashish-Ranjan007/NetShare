import { createContext, Dispatch, SetStateAction } from 'react';

const ProgressContex = createContext<Dispatch<SetStateAction<number>> | null>(
	null
);

export default ProgressContex;
