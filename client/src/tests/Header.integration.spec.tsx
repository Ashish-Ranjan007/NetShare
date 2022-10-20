import 'whatwg-fetch';
import { describe, it } from 'vitest';
import { act } from 'react-dom/test-utils';

import {
	screen,
	waitFor,
	render,
	userEvent,
	cleanup,
} from '../utils/test-utils';
import Searchbar from '../components/Header/Searchbar';
import { store } from '../app/store';
import { setCredentials } from '../features/auth/authSlice';

afterEach(cleanup);

describe('Searchbar', () => {
	it('should render a form', async () => {
		await act(async () => {
			render(<Searchbar />);
		});

		const searchInput = await screen.findByTestId('searchbar');

		waitFor(() => expect(searchInput).toBeInTheDocument());
	});

	it('should open a submenu of recent searches when searchbar is focused', async () => {
		store.dispatch(
			setCredentials({
				id: 'userid',
				email: 'email@email.com',
				username: 'username123',
				profilePic: 'profilePic',
				recentSearches: [
					{
						id: 'id',
						username: 'username123',
						profilePic: 'profilePic',
					},
				],
				friends: [],
				followers: [],
				followings: [],
				accessToken: 'accessToken',
				isAuthenticated: true,
			})
		);

		render(<Searchbar />);

		const searchInput = screen.getByTestId('searchbar');

		await userEvent.click(searchInput);

		const menuItem = await screen.findByText(/username123/i);

		waitFor(() => expect(menuItem).toBeInTheDocument());
	});

	it('should close the submenu of recent searches when user clicks outside', async () => {
		store.dispatch(
			setCredentials({
				id: 'userid',
				email: 'email@email.com',
				username: 'username123',
				profilePic: 'profilePic',
				recentSearches: [
					{
						id: 'id',
						username: 'username123',
						profilePic: 'profilePic',
					},
				],
				friends: [],
				followers: [],
				followings: [],
				accessToken: 'accessToken',
				isAuthenticated: true,
			})
		);

		render(<Searchbar />);

		const searchInput = screen.getByTestId('searchbar');

		await userEvent.click(searchInput);

		const menuItem = await screen.findByText(/username123/i);

		await userEvent.click(document.body);

		waitFor(() => expect(menuItem).not.toBeInTheDocument());
	});

	it('should search as you type', async () => {
		render(<Searchbar />);

		const searchInput = screen.getByTestId('searchbar');

		await userEvent.type(searchInput, 'usern');

		const text = await screen.findByText(/username123/);

		waitFor(() => expect(text).toBeInTheDocument());
	});

	it('should redirect to profile page when user clicks on an option', async () => {
		render(<Searchbar />);

		const searchInput = screen.getByTestId('searchbar');

		await userEvent.type(searchInput, 'usern');

		const text = await screen.findByRole('button', {
			name: /username123/i,
		});

		await userEvent.click(text);

		waitFor(() =>
			expect(screen.findByText(/profilepage/i)).toBeInTheDocument()
		);
	});

	it('should redirect to search page when user submits the form', async () => {
		render(<Searchbar />);

		const searchInput = screen.getByTestId('searchbar');

		await userEvent.type(searchInput, 'username');
		await userEvent.keyboard('Enter');

		waitFor(() => {
			expect(screen.findByText(/searchresultspage/i)).toBeInTheDocument();
			expect(screen.findByTestId(/username/i)).toBeInTheDocument();
		});
	});
});
