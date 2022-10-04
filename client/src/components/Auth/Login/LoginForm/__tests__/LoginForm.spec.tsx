import 'whatwg-fetch';
import { describe, expect, it, vi } from 'vitest';

import LoginForm from '../index';
import {
	render,
	screen,
	userEvent,
	waitFor,
} from '../../../../../utils/test-utils';

afterEach(() => {
	vi.clearAllMocks();
	vi.resetAllMocks();
	vi.restoreAllMocks();
});

describe('LoginForm', () => {
	it('should render a form', async () => {
		render(<LoginForm />);

		const form = await screen.findByRole('form');

		expect(form).toBeInTheDocument();
	});

	it('should have submit button disabled before user interacts for the first time', async () => {
		render(<LoginForm />);

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		await waitFor(() => expect(submitBtn).toBeDisabled());
	});

	it('should have submit button enabled when all the form values are valid', async () => {
		render(<LoginForm />);

		const email = await screen.findByRole('textbox', { name: /email/i });
		const password = await screen.findByLabelText(/password/i);

		await userEvent.type(email, 'email@email.com');
		await userEvent.type(password, 'Password123/');

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		await waitFor(() => expect(submitBtn).toBeEnabled());
	});

	it('should disable the submit button immediately after user submits the form', async () => {
		render(<LoginForm />);

		const email = await screen.findByRole('textbox', { name: /email/i });
		const password = await screen.findByLabelText(/password/i);

		await userEvent.type(email, 'email@email.com');
		await userEvent.type(password, 'Password123/');

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		await userEvent.click(submitBtn);

		await waitFor(() => expect(submitBtn).toBeDisabled());
	});

	it('should enable the submit button after form submission is completed', async () => {
		render(<LoginForm />);

		const email = await screen.findByRole('textbox', { name: /email/i });
		const password = await screen.findByLabelText(/password/i);

		await userEvent.type(email, 'email@email.com');
		await userEvent.type(password, 'Password123/');

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		await userEvent.click(submitBtn);

		await waitFor(() => expect(submitBtn).toBeEnabled());
	});

	it('should render error message when authentication fails', async () => {
		render(<LoginForm />);

		const email = await screen.findByRole('textbox', { name: /email/i });
		const password = await screen.findByLabelText(/password/i);

		await userEvent.type(email, 'email@email.com');
		await userEvent.type(password, 'Password123/');

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		await userEvent.click(submitBtn);

		const loginError = await screen.findByText('Invalid Credentials');

		await waitFor(() => expect(loginError).toBeInTheDocument());
	});
});
