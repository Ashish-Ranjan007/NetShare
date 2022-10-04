/* eslint-disable import/export */
import { FC, ReactElement } from 'react';
import { cleanup, render, RenderOptions } from '@testing-library/react';
import { afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { store } from '../app/store';
import { BrowserRouter as Router } from 'react-router-dom';

afterEach(() => {
	cleanup();
});

const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<Provider store={store}>
			<Router>{children}</Router>
		</Provider>
	);
};

const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, 'wrapper'>
) =>
	render(ui, {
		// wrap provider(s) here if needed
		wrapper: AllTheProviders,
		...options,
	});

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
// override render export
export { customRender as render };
