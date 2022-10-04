import 'whatwg-fetch';
import { describe, vi } from 'vitest';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import { render, screen, userEvent, waitFor } from '../utils/test-utils';
import App from '../App';

describe('Login', () => {
	it('should render a form', async () => {
		render(<App />);

		const form = await screen.findByRole('form');

		expect(form).toBeInTheDocument();
	});

	it('should display error message when invalid field format is provided', async () => {
		render(<App />);

		const email = await screen.findByRole('textbox', { name: /email/i });
		const password = await screen.findByLabelText(/password/i);

		await userEvent.type(email, 'asdfasdf');
		await userEvent.type(password, 'kasjhf');
		await userEvent.click(email);

		const emailError = await screen.findByText(/invalid email format/i);
		const passwordError = await screen.findByText(
			/password must have atleast 8 characters/i
		);

		await waitFor(() => {
			expect(emailError).toBeInTheDocument();
			expect(passwordError).toBeInTheDocument();
		});
	});

	it('should display an error message when authentication fails', async () => {
		render(<App />);

		const email = await screen.findByRole('textbox', { name: /email/i });
		const password = await screen.findByLabelText(/password/i);

		await userEvent.type(email, 'email@email.com');
		await userEvent.type(password, 'Password123/');

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});
		await userEvent.click(submitBtn);

		const authError = await screen.findByText(/invalid credentials/i);

		await waitFor(() => {
			expect(authError).toBeInTheDocument();
		});
	});

	it('should redirect to home route when authentication passes', async () => {
		render(<App />);

		const email = await screen.findByRole('textbox', { name: /email/i });
		const password = await screen.findByLabelText(/password/i);

		await userEvent.type(email, 'email123@email.com');
		await userEvent.type(password, 'Password123/');

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});
		await userEvent.click(submitBtn);

		const helloWorldText = await screen.findByText('Mocked Hello World');

		await waitFor(() => expect(helloWorldText).toBeInTheDocument());
	});
});

describe('Signup', () => {
	const fillForm = async (values: any) => {
		const fName = await screen.findByRole('textbox', {
			name: /first name/i,
		});
		const lName = await screen.findByRole('textbox', {
			name: /last name/i,
		});
		const username = await screen.findByRole('textbox', {
			name: /username/i,
		});
		const email = await screen.findByRole('textbox', { name: /email/i });
		const password = await screen.findByLabelText(/^password/i);
		const confirmPassword = await screen.findByLabelText(
			/confirm password/i
		);

		await userEvent.type(fName, values.fName);
		await userEvent.type(lName, values.lName);
		await userEvent.type(username, values.username);
		await userEvent.type(email, values.email);
		await userEvent.type(password, values.password);
		await userEvent.type(confirmPassword, values.password);
	};

	it('should render a form', async () => {
		render(<App />);

		const signUpLink = await screen.findByText(/sign up/i);
		await userEvent.click(signUpLink);

		const form = await screen.findByRole('form');

		expect(form).toBeInTheDocument();
	});

	it('should display error message when invalid field format is provided', async () => {
		render(<App />);

		const formValues = {
			fName: 'fName',
			lName: 'lName',
			username: 'username',
			email: 'email',
			password: 'pass',
		};

		await fillForm(formValues);

		const emailError = await screen.findByText(/invalid email format/i);
		const passwordError = await screen.findByText(
			/password must have atleast 8 characters/i
		);

		await waitFor(() => {
			expect(emailError).toBeInTheDocument();
			expect(passwordError).toBeInTheDocument();
		});
	});

	it('should display an error message when authentication fails', async () => {
		render(<App />);

		const formValues = {
			fName: 'fName',
			lName: 'lName',
			username: 'username',
			email: 'email@email.com',
			password: 'password123/',
		};

		await fillForm(formValues);

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});
		await userEvent.click(submitBtn);

		const authError = await screen.findByText(/email already exists/i);

		await waitFor(() => expect(authError).toBeInTheDocument());
	});

	it('should redirect to home route when authentication passes', async () => {
		render(<App />);

		const formValues = {
			fName: 'fName',
			lName: 'lName',
			username: 'username',
			email: 'email123@email.com',
			password: 'password123/',
		};

		await fillForm(formValues);

		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});
		await userEvent.click(submitBtn);

		const helloWorldText = await screen.findByText('Mocked Hello World');

		await waitFor(() => expect(helloWorldText).toBeInTheDocument());
	});
});
