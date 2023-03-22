import request from 'supertest';

import { app } from '../../app';
import { User } from '../../models/User.model';
import * as VerifyToken from '../../utils/verifyJWT';
import * as SendJWTTokens from '../../utils/sendToken';

// Mocks
jest.mock('../../utils/verifyJWT');
jest.mock('../../utils/sendToken');
jest.mock('../../models/User.model');

// Setup to Authenticate request of every test
beforeEach(() => {
	(VerifyToken.verifyJWT as any) = jest.fn().mockReturnValueOnce({
		payload: { _id: '_id' },
		invalid: false,
	});

	User.findById = jest.fn().mockResolvedValueOnce({
		_id: 'userId',
		email: 'email',
		username: 'username',
	});
});

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Integration tests for the register auth route', () => {
	const requestBody = {
		firstname: 'firtstname',
		lastname: 'lastname',
		username: 'username',
		email: 'email@email.com',
		password: 'Password123/',
		confirmPassword: 'Password123/',
	};

	it('POST /api/auth/register - success - create a new user', async () => {
		User.exists = jest.fn().mockResolvedValue(false);
		User.create = jest.fn().mockImplementationOnce((x) => x);

		(SendJWTTokens.sendToken as any) = jest
			.fn()
			.mockImplementationOnce((user, statusCode, res) => {
				res.status(statusCode).json({
					success: true,
					data: {
						userObj: {
							email: user.email,
							username: user.username,
						},
					},
					error: '',
					token: 'accessToken',
				});
			});

		const response = await request(app)
			.post('/api/auth/register')
			.send(requestBody);

		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			success: true,
			data: {
				userObj: {
					email: 'email@email.com',
					username: 'username',
				},
			},
			error: '',
			token: 'accessToken',
		});
	});

	it('POST /api/auth/register - failure on invalid post body', async () => {
		// Set password property of request body to be invalid
		requestBody.password = 'Password';
		requestBody.confirmPassword = 'Password';

		const response = await request(app)
			.post('/api/auth/register')
			.send(requestBody);

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Password should contain atleast 8 characters containing one uppercase, one lowercase, one numeric and one special character.'
		);
	});

	it('POST /api/auth/register - failure on existing email', async () => {
		// Reset password property of request body to be valid
		requestBody.password = 'Password123/';
		requestBody.confirmPassword = 'Password123/';

		User.exists = jest.fn().mockResolvedValue(true);

		const response = await request(app)
			.post('/api/auth/register')
			.send(requestBody);

		expect(response.statusCode).toBe(409);
		expect(response.body.error).toBe('Email already exists');
	});

	it('POST /api/auth/register - failure on existing username', async () => {
		User.exists = jest
			.fn()
			.mockResolvedValue(true)
			.mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/auth/register')
			.send(requestBody);

		expect(response.statusCode).toBe(409);
		expect(response.body.error).toBe('Username already exists');
	});
});

describe('Integration tests for the login auth route', () => {
	it('POST /api/auth/login - success - login an existing user', async () => {
		const mockedUserInstance = {
			email: 'email',
			username: 'username',
			matchPasswords: () => true,
			populate: jest.fn().mockResolvedValueOnce({}),
		};

		User.findOne = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce(mockedUserInstance),
		}));

		(SendJWTTokens.sendToken as any) = jest
			.fn()
			.mockImplementationOnce((user, statusCode, res) => {
				res.status(statusCode).json({
					success: true,
					data: {
						userObj: {
							email: user.email,
							username: user.username,
						},
					},
					error: '',
					token: 'accessToken',
				});
			});

		const response = await request(app)
			.post('/api/auth/login')
			.send({ email: 'email@email.com', password: 'password123' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				userObj: {
					email: 'email',
					username: 'username',
				},
			},
			error: '',
			token: 'accessToken',
		});
	});

	it('POST /api/auth/login - failure on invalid post body schema', async () => {
		const response = await request(app)
			.post('/api/auth/login')
			.send({ email: 'email', password: '' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Please enter a valid email');
	});

	it('POST /api/auth/login - failure on invalid email', async () => {
		User.findOne = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce(null),
		}));

		const response = await request(app)
			.post('/api/auth/login')
			.send({ email: 'email@email.com', password: 'password123' });

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe('Invalid Credentials');
	});

	it('POST /api/auth/login - failure on invalid password', async () => {
		User.findOne = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce({
				matchPasswords: () => false,
			}),
		}));

		const response = await request(app)
			.post('/api/auth/login')
			.send({ email: 'email@email.com', password: 'password123' });

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe('Invalid Credentials');
	});
});

describe('Integration tests for the logout auth route', () => {
	it('POST /api/auth/logout - success - logout an existing user', async () => {
		User.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.post('/api/auth/logout')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
			token: '',
		});
	});
});

describe('Integration tests for the refresh-token route', () => {
	it('GET /api/auth/refresh-token - success - create and send a new accessToken', async () => {
		User.findOne = jest.fn().mockImplementationOnce(() => ({
			_id: 'userid',
			email: 'email',
			username: 'username',
			profilePic: 'profilePic',
			postsCount: 0,
			friendsCount: 0,
			followersCount: 0,
			followingsCount: 0,
			friends: [],
			followers: [],
			followings: [],
			recentSearches: [],
			notificationCount: 0,
			getSignedToken: jest.fn().mockImplementationOnce(() => {
				return 'accessToken';
			}),
			populate: jest.fn().mockResolvedValueOnce({}),
		}));

		(VerifyToken.verifyJWT as any) = jest.fn().mockReturnValueOnce({
			payload: { _id: '_id' },
			invalid: false,
		});

		const response = await request(app)
			.get('/api/auth/refresh-token')
			.set('Cookie', ['refreshToken=refreshToken']);

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				userObj: {
					_id: 'userid',
					email: 'email',
					username: 'username',
					profilePic: 'profilePic',
					postsCount: 0,
					friendsCount: 0,
					followersCount: 0,
					followingsCount: 0,
					friends: [],
					followers: [],
					followings: [],
					notifications: 0,
					recentSearches: [],
				},
			},
			error: '',
			token: 'accessToken',
		});
	});

	it('GET /api/auth/refresh-token - failure on empty refreshToken cookie', async () => {
		const response = await request(app).get('/api/auth/refresh-token');

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe('Unauthorized');
	});

	it('GET /api/auth/refresh-token - failure if no user exists with such refreshToken', async () => {
		User.findOne = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.get('/api/auth/refresh-token')
			.set('Cookie', ['refreshToken=refreshToken']);

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe(
			'Please Login to access this resource'
		);
	});

	it('GET /api/auth/refresh-token - failure on invalid refreshToken', async () => {
		User.findOne = jest.fn().mockResolvedValueOnce({
			email: 'email',
			username: 'username',
			getSignedToken: jest.fn().mockImplementationOnce(() => {
				return 'accessToken';
			}),
		});

		(VerifyToken.verifyJWT as any) = jest.fn().mockReturnValueOnce({
			payload: { _id: '_id' },
			invalid: true,
		});

		const response = await request(app)
			.get('/api/auth/refresh-token')
			.set('Cookie', ['refreshToken=refreshToken']);

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe(
			'Please Login to access this resource'
		);
	});
});

describe('Integration tests for the whoami route', () => {
	it('GET /api/auth/user - success - send user details', async () => {
		User.findById = jest.fn().mockImplementationOnce(() => ({
			_id: 'userid',
			profilePic: 'profilePic',
			username: 'username',
			recentSearches: [{ id: 'userId' }],
			save: jest.fn(),
		}));

		User.find = jest.fn().mockImplementationOnce(() => ({
			lean: jest.fn().mockResolvedValueOnce([{ followers: [] }]),
		}));

		const response = await request(app)
			.get('/api/auth/user/?username=username')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				user: {
					followers: [],
					isFollowing: false,
				},
			},
			error: '',
		});
	});
});

describe('Integration tests for search route', () => {
	it('GET /api/auth/search/?searchTerm=username - success - send matched users', async () => {
		User.find = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				skip: jest.fn().mockImplementationOnce(() => ({
					limit: jest.fn().mockResolvedValueOnce([
						{
							_id: '_id',
							profilePic: 'profilePic',
							username: 'username',
						},
					]),
				})),
			})),
		}));

		const response = await request(app)
			.get('/api/auth/search/?searchTerm=username')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				results: [
					{
						_id: '_id',
						profilePic: 'profilePic',
						username: 'username',
					},
				],
			},
			error: '',
		});
	});

	it('GET /api/auth/search/?searchTerm=username - failure if no searchTerm is provided', async () => {
		const response = await request(app)
			.get('/api/auth/search/?searchTerm=')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Search term not provided');
	});
});

describe('Integration tests for add-recent-search route', () => {
	const requestBody = {
		userId: 'userid',
	};

	it('POST /api/auth/add-recent-search - success - add recentlySearchesUser to recentSearches on currentUser', async () => {
		User.findById = jest.fn().mockResolvedValue({
			_id: 'userid',
			profilePic: 'profilePic',
			username: 'username',
			recentSearches: ['userId'],
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/auth/add-recent-search')
			.set('Authorization', 'Bearer token')
			.send(requestBody);

		expect(response.statusCode).toBe(201);
	});

	it('POST /api/auth/add-recent-search - failure if no userId is provided', async () => {
		const response = await request(app)
			.post('/api/auth/add-recent-search')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No user id is provided');
	});

	it('POST /api/auth/add-recent-search - failure if recentlySearchedUser doesnt exists in user collection', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValue(false)
			.mockResolvedValueOnce(true);

		const response = await request(app)
			.post('/api/auth/add-recent-search')
			.set('Authorization', 'Bearer token')
			.send(requestBody);

		expect(response.statusCode).toBe(200);
	});

	it('POST /api/auth/add-recent-search - failure if recentlySearchedUser already exists in recentSearches', async () => {
		User.findById = jest.fn().mockResolvedValue({
			_id: 'userid',
			profilePic: 'profilePic',
			username: 'username',
			recentSearches: ['userid'],
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/auth/add-recent-search')
			.set('Authorization', 'Bearer token')
			.send(requestBody);

		expect(response.statusCode).toBe(200);
	});
});

describe('Integration tests for follow route', () => {
	it("POST /api/auth/follow - success - push user into target's followers array and push target into user's followings array", async () => {
		const requestBody = {
			userId: 'userid',
			targetId: 'targetid',
		};

		User.findById = jest
			.fn()
			.mockResolvedValueOnce({ _id: 'userid' })
			.mockResolvedValueOnce({
				_id: 'userid',
				friends: [],
				followings: ['id'],
				username: 'user',
				profilePic: 'profilePic',
				followers: [],
				friendsCount: 0,
				followingsCount: 0,
				save: jest.fn(),
			})
			.mockResolvedValueOnce({
				_id: '_id',
				friends: [],
				frinedsCount: 0,
				username: 'username123',
				profilePic: 'profilePic123',
				notifications: [],
				followersCount: 0,
				notificationCount: 0,
				followers: [],
				save: jest.fn(),
			});

		const response = await request(app)
			.post('/api/auth/follow')
			.set('Authorization', 'Bearer token')
			.set(requestBody);

		expect(response.statusCode).toBe(200);
	});

	it('POST /api/auth/follow - failure if target or user does not exist', async () => {
		const requestBody = {
			targetId: 'targetid',
		};

		// Three mockResolvedValueOnce are required because this request also goes through
		// isAuthenticated middleware which calls findById too
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({ _id: 'userid' })
			.mockResolvedValueOnce({})
			.mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/auth/follow')
			.set('Authorization', 'Bearer token')
			.set(requestBody);

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('User does not exist');
	});

	it('POST /api/auth/follow - failure if user already follows target', async () => {
		const requestBody = {
			targetId: 'targetid',
		};

		// Three mockResolvedValueOnce are required because this request also goes through
		// isAuthenticated middleware which calls findById too
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({ _id: 'userid' })
			.mockResolvedValueOnce({
				followings: ['_id'],
				save: jest.fn(),
			})
			.mockResolvedValueOnce({
				_id: '_id',
				username: 'username123',
				profilePic: 'profilePic123',
				save: jest.fn(),
			});

		const response = await request(app)
			.post('/api/auth/follow')
			.set('Authorization', 'Bearer token')
			.set(requestBody);

		expect(response.statusCode).toBe(409);
		expect(response.body.error).toBe('User is already followed');
	});
});

describe('Integration tests for unfollow route', () => {
	it("POST /api/auth/unfollow - success - remove user from target's followers array and remove target from user's followings array", async () => {
		const requestBody = {
			targetId: 'targetid',
		};

		User.findById = jest
			.fn()
			.mockResolvedValueOnce({ _id: 'userid' })
			.mockResolvedValueOnce({
				_id: 'userId',
				followings: ['targetid'],
				friends: [],
				save: jest.fn(),
			})
			.mockResolvedValueOnce({
				_id: 'targetid',
				username: 'username123',
				followers: ['userid'],
				friends: [],
				profilePic: 'profilePic123',
				save: jest.fn(),
			});

		const response = await request(app)
			.post('/api/auth/unfollow')
			.set('Authorization', 'Bearer token')
			.set(requestBody);

		expect(response.statusCode).toBe(200);
	});

	it('POST /api/auth/unfollow - failure if target or user does not exists', async () => {
		const requestBody = {
			targetId: 'targetid',
		};

		User.findById = jest
			.fn()
			.mockResolvedValueOnce({ _id: 'userid' })
			.mockResolvedValueOnce({
				followings: ['targetid'],
				save: jest.fn(),
			})
			.mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/auth/unfollow')
			.set('Authorization', 'Bearer token')
			.set(requestBody);

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('User does not exist');
	});
	it('POST /api/auth/unfollow - failure if user doesnt already follows target', async () => {
		const requestBody = {
			targetId: 'targetid',
		};

		User.findById = jest
			.fn()
			.mockResolvedValueOnce({ _id: 'userid' })
			.mockResolvedValueOnce({
				followings: ['targetid'],
				save: jest.fn(),
			})
			.mockResolvedValueOnce({
				_id: 'id',
				username: 'username123',
				followers: ['userid'],
				profilePic: 'profilePic123',
				save: jest.fn(),
			});

		const response = await request(app)
			.post('/api/auth/unfollow')
			.set('Authorization', 'Bearer token')
			.set(requestBody);

		expect(response.statusCode).toBe(409);
		expect(response.body.error).toBe('User is not followed already');
	});
});

describe('Integration tests for getFollowers route', () => {
	it('POST /api/auth/followers - success - if no searchTerm exists return any followers', async () => {
		User.findById = jest
			.fn()
			.mockImplementationOnce(() => ({ _id: 'userid123' }))
			.mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce({
					followers: [
						{
							_id: 'id',
							profilePic: 'profilePic',
							username: 'username',
						},
					],
					followersCount: 0,
				}),
			}));

		const response = await request(app)
			.get('/api/auth/followers/?userId=userId')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				hasPrev: false,
				hasNext: false,
				followers: [
					{
						_id: 'id',
						profilePic: 'profilePic',
						username: 'username',
					},
				],
			},
			error: '',
		});
	});

	it('POST /api/auth/followers - success - if searchTerm exists return followers that match searchTerm', async () => {
		User.findById = jest
			.fn()
			.mockImplementationOnce(() => ({ _id: 'userid123' }))
			.mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce({
					followers: [
						{
							_id: 'id',
							profilePic: 'profilePic',
							username: 'username',
						},
					],
					followersCount: 0,
				}),
			}));

		const response = await request(app)
			.get('/api/auth/followers/?userId=userId')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				hasPrev: false,
				hasNext: false,
				followers: [
					{
						_id: 'id',
						profilePic: 'profilePic',
						username: 'username',
					},
				],
			},
			error: '',
		});
	});
});

describe('Integration tests for getFollowings route', () => {
	it('POST /api/auth/followings - success - if no searchTerm exists return any followings', async () => {
		User.findById = jest
			.fn()
			.mockImplementationOnce(() => ({ _id: 'userid123' }))
			.mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce({
					followings: [
						{
							_id: 'id',
							profilePic: 'profilePic',
							username: 'username',
						},
					],
				}),
			}));

		const response = await request(app)
			.get('/api/auth/followings/?userId=userId')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				hasPrev: false,
				hasNext: false,
				followings: [
					{
						_id: 'id',
						profilePic: 'profilePic',
						username: 'username',
					},
				],
			},
			error: '',
		});
	});

	it('POST /api/auth/followings - success - if searchTerm exists return followings that match searchTerm', async () => {
		User.findById = jest
			.fn()
			.mockImplementationOnce(() => ({ _id: 'userid123' }))
			.mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce({
					followings: [
						{
							_id: 'id',
							profilePic: 'profilePic',
							username: 'username',
						},
					],
				}),
			}));

		const response = await request(app)
			.get('/api/auth/followings/?userId=userId')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				hasPrev: false,
				hasNext: false,
				followings: [
					{
						_id: 'id',
						profilePic: 'profilePic',
						username: 'username',
					},
				],
			},
			error: '',
		});
	});
});

describe('Integration tests for getFriends route', () => {
	it('GET /api/auth/friends - success - if no searchTerm exists return any friends', async () => {
		User.findById = jest
			.fn()
			.mockImplementationOnce(() => ({ _id: 'userid123' }))
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => ({
					populate: jest.fn().mockResolvedValueOnce({
						friends: [
							{
								_id: 'id',
								profilePic: 'profilePic',
								username: 'username',
							},
						],
					}),
				})),
			}));

		const response = await request(app)
			.get('/api/auth/friends')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				results: [
					{
						_id: 'id',
						profilePic: 'profilePic',
						username: 'username',
					},
				],
			},
			error: '',
		});
	});

	it('POST /api/auth/friends - success - if searchTerm exists return friends that match searchTerm', async () => {
		User.findById = jest
			.fn()
			.mockImplementationOnce(() => ({ _id: 'userid123' }))
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => ({
					populate: jest.fn().mockResolvedValueOnce({
						friends: [
							{
								_id: 'id',
								username: 'username123',
								profilePic: 'profilePic',
							},
						],
					}),
				})),
			}));

		const response = await request(app)
			.get('/api/auth/friends/?searchTerm=username123')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				results: [
					{
						_id: 'id',
						profilePic: 'profilePic',
						username: 'username123',
					},
				],
			},
			error: '',
		});
	});
});
