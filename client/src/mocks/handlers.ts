import { rest } from 'msw';

export const handlers = [
	rest.get(
		'http://localhost:8000/api/auth/refresh-token',
		(req, res, ctx) => {
			return res(
				ctx.status(401),
				ctx.json({
					success: false,
					data: {
						test: 'this is the mocked api response',
					},
					error: 'Unauthorized',
				})
			);
		}
	),
	rest.post('http://localhost:8000/api/auth/login', async (req, res, ctx) => {
		const { email, username } = await req.json();

		if (email === 'email@email.com') {
			return res(
				ctx.status(401),
				ctx.json({
					success: false,
					data: {
						test: 'this is the mocked api response',
					},
					error: 'Invalid Credentials',
				})
			);
		}

		return res(
			ctx.status(200),
			ctx.json({
				success: true,
				data: {
					userObj: {
						email: email,
						username: username,
						profilePic: '',
						recentSearches: [
							{
								id: 'id',
								username: 'username',
								profilePic: 'profilePic',
							},
						],
					},
				},
				error: '',
				token: 'accessToken',
			})
		);
	}),
	rest.post(
		'http://localhost:8000/api/auth/register',
		async (req, res, ctx) => {
			const { email, username } = await req.json();

			if (email === 'email@email.com') {
				return res(
					ctx.status(409),
					ctx.json({
						success: false,
						data: {
							test: 'this is the mocked api response',
						},
						error: 'Email already exists',
					})
				);
			}

			return res(
				ctx.status(200),
				ctx.json({
					success: true,
					data: {
						userObj: {
							email: email,
							username: username,
							profilePic: '',
							recentSearches: [],
						},
					},
					error: '',
					token: 'accessToken',
				})
			);
		}
	),
	rest.get('http://localhost:8000/api/home/feeds', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				success: true,
				feeds: { message: 'Mocked Hello World' },
			})
		);
	}),
	rest.get('http://localhost:8000/api/auth/search/', (req, res, ctx) => {
		return res(
			ctx.status(200),
			ctx.json({
				success: true,
				data: {
					results: [
						{
							profilePic: 'profilePic',
							id: 'id',
							username: 'username123',
						},
					],
				},
			})
		);
	}),
	rest.post(
		'http://localhost:8000/api/auth/add-recent-search',
		(req, res, ctx) => {
			return res(
				ctx.status(200),
				ctx.json({
					success: true,
					data: {},
				})
			);
		}
	),
];
