import request from 'supertest';

import { app } from '../../app';
import { User } from '../../models/User.model';
import * as VerifyToken from '../../utils/verifyJWT';

// mocks
jest.mock('../../utils/verifyJWT');
jest.mock('../../utils/sendToken');
jest.mock('../../models/User.model');
jest.mock('../../models/Post.model');
jest.mock('../../models/Reply.model');
jest.mock('../../models/Comment.model');

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
		profilePic: 'profilePic',
	});
});

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Integration test for edit profile route', () => {
	const requestBody = {
		userId: 'userId',
		profilePic: 'profilePic',
		firstname: 'firstname',
		lastname: 'lastname',
		bio: 'bio',
		dateOfBirth: 'dateOfBirth',
		gender: 'male',
	};

	it('POST /api/settings/profile - success - update profile', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce({
					_id: 'userid',
					bio: 'bio',
					dateOfBirth: 'dateOfBirth',
					gender: 'gender',
					firstname: 'firstname',
					lastname: 'lastname',
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
					save: jest.fn(),
				}),
			}));

		const response = await request(app)
			.post('/api/settings/profile')
			.set('Authorization', 'Bearer Token')
			.send(requestBody);

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				userObj: {
					_id: 'userid',
					bio: 'bio',
					email: 'email',
					dateOfBirth: 'dateOfBirth',
					username: 'username',
					firstname: 'firstname',
					lastname: 'lastname',
					gender: 'male',
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
		});
	});

	it('POST /api/settings/profile - failure if user is invalid', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce(false),
			}));

		const response = await request(app)
			.post('/api/settings/profile')
			.set('Authorization', 'Bearer Token')
			.send(requestBody);

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid user');
	});
});

describe('Integration test for change password route', () => {
	it('POST /api/settings/change-password - success - change password', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => ({
					password: '',
					save: jest.fn(),
					matchPasswords: jest.fn().mockResolvedValueOnce(true),
				})),
			}));

		const response = await request(app)
			.post('/api/settings/change-password')
			.set('Authorization', 'Bearer Token')
			.send({
				userId: 'userId',
				oldPassword: 'oldPassword',
				newPassword: 'newPassword',
			});

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('POST /api/settings/change-password - failure if no userId or password is provided', async () => {
		User.findById = jest.fn().mockResolvedValueOnce({
			_id: 'id',
			email: 'email',
			username: 'username',
			profilePic: 'profilePic',
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/settings/change-password')
			.set('Authorization', 'Bearer Token')
			.send({
				oldPassword: 'oldPassword',
				newPassword: 'newPassword',
			});

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('userId not provided');
	});

	it('POST /api/settings/change-password - failure if userId is invalid', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => false),
			}));

		const response = await request(app)
			.post('/api/settings/change-password')
			.set('Authorization', 'Bearer Token')
			.send({
				userId: 'userId',
				oldPassword: 'oldPassword',
				newPassword: 'newPassword',
			});

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid userId');
	});

	it('POST /api/settings/change-password - failure if password is incorrect', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => ({
					password: '',
					save: jest.fn(),
					matchPasswords: jest.fn().mockResolvedValueOnce(false),
				})),
			}));

		const response = await request(app)
			.post('/api/settings/change-password')
			.set('Authorization', 'Bearer Token')
			.send({
				userId: 'userId',
				oldPassword: 'oldPassword',
				newPassword: 'newPassword',
			});

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid Credentials');
	});
});

describe('Integration test for delete account route', () => {
	it('DELETE /api/settings/delete-account - success - delete account', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => ({
					password: '',
					delete: jest.fn(),
					matchPasswords: jest.fn().mockResolvedValueOnce(true),
				})),
			}));

		const response = await request(app)
			.delete('/api/settings/delete-account')
			.set('Authorization', 'Bearer Token')
			.send({
				userId: 'userId',
				password: 'password',
			});

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('DELETE /api/settings/delete-account - failure if no userId or password is provided', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => false),
			}));

		const response = await request(app)
			.delete('/api/settings/delete-account')
			.set('Authorization', 'Bearer Token')
			.send({
				password: 'password',
			});

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No userId or password is provided');
	});

	it('DELETE /api/settings/delete-account -  failure if userId is invalid', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => false),
			}));

		const response = await request(app)
			.delete('/api/settings/delete-account')
			.set('Authorization', 'Bearer Token')
			.send({
				userId: 'userId',
				password: 'password',
			});

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid userId');
	});

	it('DELETE /api/settings/delete-account -  failure if password is incorrect', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => ({
					password: '',
					delete: jest.fn(),
					matchPasswords: jest.fn().mockResolvedValueOnce(false),
				})),
			}));

		const response = await request(app)
			.delete('/api/settings/delete-account')
			.set('Authorization', 'Bearer Token')
			.send({
				userId: 'userId',
				password: 'password',
			});

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe('Invalid Credentials');
	});
});
