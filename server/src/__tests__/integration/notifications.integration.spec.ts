import request from 'supertest';
import { app } from '../../app';

import { User } from '../../models/User.model';
import * as VerifyToken from '../../utils/verifyJWT';

// mocks
jest.mock('../../utils/verifyJWT');
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

describe('Integration tests for get notifications route', () => {
	it('GET /api/notifications - success - send back notifications', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => ({
					sort: jest.fn().mockImplementationOnce(() => ({
						then: jest.fn().mockResolvedValueOnce([]),
					})),
				})),
			}));

		const response = await request(app)
			.get('/api/notifications')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: { hasPrev: false, hasNext: false, notifications: [] },
			error: '',
		});
	});
});

describe('Integration tests for get notificationHistory route', () => {
	it('GET /api/notifications/history - success - send back notificationHistory', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockImplementationOnce(() => ({
					sort: jest.fn().mockImplementationOnce(() => ({
						then: jest.fn().mockResolvedValueOnce([]),
					})),
				})),
			}));

		const response = await request(app)
			.get('/api/notifications/history')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: { hasPrev: false, hasNext: false, notificationHistory: [] },
			error: '',
		});
	});
});

describe('Integration tests for get notificationHistory route', () => {
	it('POST /api/notifications/clear-all - success - put all notifications into notificationHistory', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				notificationCount: 0,
				notifications: [],
				notificationHistory: [],
				save: jest.fn(),
			});

		const response = await request(app)
			.post('/api/notifications/clear-all')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});
});
