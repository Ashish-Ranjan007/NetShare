import request from 'supertest';

import { app } from '../../app';
import { User } from '../../models/User';
import * as VerifyToken from '../../utils/verifyJWT';
import * as SendJWTTokens from '../../utils/sendToken';

// Mocks
jest.mock('../../models/User');
jest.mock('../../utils/verifyJWT');
jest.mock('../../utils/sendToken');

// Setup to Authenticate request of every test
beforeEach(() => {
	(VerifyToken.verifyJWT as any) = jest.fn().mockReturnValueOnce({
		payload: { _id: '_id' },
		invalid: false,
	});

	User.findById = jest.fn().mockResolvedValueOnce({
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
		User.findOne = jest.fn().mockResolvedValue(false);
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

		User.findOne = jest.fn().mockResolvedValue(true);

		const response = await request(app)
			.post('/api/auth/register')
			.send(requestBody);

		expect(response.statusCode).toBe(409);
		expect(response.body.error).toBe('Email already exists');
	});

	it('POST /api/auth/register - failure on existing username', async () => {
		User.findOne = jest
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
		User.findOne = jest.fn().mockResolvedValueOnce({
			email: 'email',
			username: 'username',
			getSignedToken: jest.fn().mockImplementationOnce(() => {
				return 'accessToken';
			}),
		});

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
					email: 'email',
					username: 'username',
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
	it('GET /api/auth/whoami - success - send user details', async () => {
		const response = await request(app)
			.get('/api/auth/whoami')
			.set('Authorization', 'Bearer token');

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
		});
	});
});
