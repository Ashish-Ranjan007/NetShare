import 'whatwg-fetch';
import { describe, expect, it } from 'vitest';

import Login from '..';
import { act } from 'react-dom/test-utils';
import { render, screen } from '../../../../utils/test-utils';

describe('Login', () => {
	it('renders login component', async () => {
		await act(async () => {
			render(<Login />);
		});

		const loginText = await screen.findByRole('heading', {
			name: /login to your account/i,
		});
		const emailField = await screen.findByRole('textbox', {
			name: /email/i,
		});
		const passwordField = await screen.findByLabelText(/password/i);
		const submitButton = await screen.findByRole('button', {
			name: /submit/i,
		});

		expect(loginText).toBeInTheDocument();
		expect(emailField).toBeInTheDocument();
		expect(passwordField).toBeInTheDocument();
		expect(submitButton).toBeInTheDocument();
	});
});
