import 'whatwg-fetch';
import { describe, expect, it } from 'vitest';
import Friends from '..';
import { store } from '../../../app/store';
import { setCredentials } from '../../../features/auth/authSlice';
import { render, screen, userEvent, waitFor } from '../../../utils/test-utils';

describe('Friends', () => {
	beforeEach(() => {
		store.dispatch(
			setCredentials({
				id: 'userid',
				email: 'email@email.com',
				username: 'username',
				profilePic: 'profilePic',
				recentSearches: [],
				friends: [
					{
						id: 'id1',
						username: 'username1',
						profilePic: '',
					},
					{
						id: 'id2',
						username: 'username2',
						profilePic: '',
					},
				],
				followers: [],
				followings: [],
				accessToken: 'accessToken',
				isAuthenticated: true,
			})
		);
	});

	it('should render a list of all friends if no searchTerm is present', async () => {
		render(<Friends />);

		const friend1 = await screen.findByText(/username1/i);
		const friend2 = await screen.findByText(/username2/i);

		expect(friend1).toBeInTheDocument();
		expect(friend2).toBeInTheDocument();
	});

	it('should render a list of friends that matches the searchTerm if searchTerm is present', async () => {
		render(<Friends />);

		const searchbar = await screen.findByTestId('friends-searchbar');

		await userEvent.type(searchbar, 'username1');

		const friend1 = await screen.findByText(/username1/i);

		expect(searchbar).toBeInTheDocument();
		expect(friend1).toBeInTheDocument();

		waitFor(() =>
			expect(screen.findByText(/username2/i)).not.toBeInTheDocument()
		);
	});
});
