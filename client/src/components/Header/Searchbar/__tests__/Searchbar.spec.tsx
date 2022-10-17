import 'whatwg-fetch';
import { it, describe, expect } from 'vitest';

import Searchbar from '../index';
import { act } from 'react-dom/test-utils';
import { render, screen, waitFor } from '../../../../utils/test-utils';

describe('Searchbar', () => {
	it('should render a form', async () => {
		await act(async () => {
			render(<Searchbar />);
		});

		const searchInput = await screen.findByTestId('searchbar');

		waitFor(() => expect(searchInput).toBeInTheDocument());
	});
});
