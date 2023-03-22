import request from 'supertest';

import { app } from '../../app';
import { User } from '../../models/User.model';
import * as VerifyToken from '../../utils/verifyJWT';

// mocks
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
		profilePic: 'profilePic',
	});
});

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Integration test for suggested profiles route', () => {
	it('GET /api/widgets/suggested-profiles - success - get suggested profiles', async () => {
		User.find = jest.fn().mockImplementationOnce(() => ({
			limit: jest.fn().mockResolvedValueOnce([
				{
					_id: 'profileId',
					username: 'profile',
					profilePic: 'profilePic',
				},
			]),
		}));

		const response = await request(app)
			.get('/api/widgets/suggested-profiles')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				suggestedProfiles: [
					{
						_id: 'profileId',
						username: 'profile',
						profilePic: 'profilePic',
					},
				],
			},
			error: '',
		});
	});
});

describe('Integration test for birthdays route', () => {
	it('GET /api/widgets/birthdays - success - get all friends having birthday today', async () => {
		const newDate = new Date().toISOString();
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => ({
					populate: jest.fn().mockImplementationOnce(() => ({
						then: jest.fn().mockResolvedValueOnce([
							{
								_id: 'friendId',
								username: 'friend',
								profilePic: 'profilePic',
								dateOfBirth: newDate,
							},
						]),
					})),
				})),
			}));

		const response = await request(app)
			.get('/api/widgets/birthdays')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				friends: [
					{
						_id: 'friendId',
						username: 'friend',
						profilePic: 'profilePic',
						dateOfBirth: newDate,
					},
				],
			},
			error: '',
		});
	});
});
