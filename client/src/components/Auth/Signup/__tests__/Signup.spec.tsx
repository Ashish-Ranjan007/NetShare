import 'whatwg-fetch';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import Signup from '..';
import { act } from 'react-dom/test-utils';
import { render, screen } from '../../../../utils/test-utils';

describe('Signup', () => {
	it('renders signup component', async () => {
		await act(async () => {
			render(<Signup />);
		});

		const fNameField = await screen.findByRole('textbox', {
			name: /first name/i,
		});
		const lNameField = await screen.findByRole('textbox', {
			name: /last name/i,
		});
		const submitBtn = await screen.findByRole('button', {
			name: /submit/i,
		});

		expect(fNameField).toBeInTheDocument();
		expect(lNameField).toBeInTheDocument();
		expect(submitBtn).toBeInTheDocument();
	});
});
