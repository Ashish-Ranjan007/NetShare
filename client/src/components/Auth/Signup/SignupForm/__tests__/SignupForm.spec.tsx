import 'whatwg-fetch';
import { describe, expect, it, vi } from 'vitest';

import SignupForm from '../index';
import {
	render,
	screen,
	waitFor,
	userEvent,
} from '../../../../../utils/test-utils';

afterEach(() => {
	vi.clearAllMocks();
	vi.resetAllMocks();
	vi.restoreAllMocks();
});

const fillForm = async () => {
	const fName = await screen.findByRole('textbox', { name: /first name/i });
	const lName = await screen.findByRole('textbox', { name: /last name/i });
	const username = await screen.findByRole('textbox', { name: /username/i });
	const email = await screen.findByRole('textbox', { name: /email/i });
	const password = await screen.findByLabelText(/^password/i);
	const confirmPassword = await screen.findByLabelText(/confirm password/i);

	await userEvent.type(fName, 'fname');
	await userEvent.type(lName, 'lname');
	await userEvent.type(username, 'username');
	await userEvent.type(email, 'email@email.com');
	await userEvent.type(password, 'Password123/');
	await userEvent.type(confirmPassword, 'Password123/');
};

describe('SignupForm', () => {
	it('should render a form', async () => {
		render(<SignupForm />);

		const form = await screen.findByRole('form');

		expect(form).toBeInTheDocument();
	});

	it('should have submit button disabled before user interacts for the first time', async () => {
		render(<SignupForm />);

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		await waitFor(() => expect(submitBtn).toBeDisabled());
	});

	it('should have submit button enabled when all the form values are valid', async () => {
		render(<SignupForm />);

		await fillForm();

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		await userEvent.click(submitBtn);

		await waitFor(() => expect(submitBtn).toBeEnabled());
	});

	it('should disable the submit button immediately after user submits the form', async () => {
		render(<SignupForm />);

		await fillForm();

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		await userEvent.click(submitBtn);

		await waitFor(() => expect(submitBtn).toBeDisabled());
	});

	it('should enable the submit button after form submission is completed', async () => {
		render(<SignupForm />);

		await fillForm();

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		await userEvent.click(submitBtn);

		await waitFor(() => expect(submitBtn).toBeEnabled());
	});

	it('should render error message when authentication fails', async () => {
		render(<SignupForm />);

		await fillForm();

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		await userEvent.click(submitBtn);

		const registrationError = await screen.findByText(
			/Email already Exists/i
		);

		await waitFor(() => expect(registrationError).toBeInTheDocument());
	});
});
