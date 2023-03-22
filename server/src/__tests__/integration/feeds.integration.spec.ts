import request from 'supertest';
import { app } from '../../app';

import { Post } from '../../models/Post.model';
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

describe('Integration tests for feeds route', () => {
	it('GET /api/home/feeds - success - send back posts', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockResolvedValueOnce({
					friends: [],
					followings: [],
				}),
			}));
		Post.find = jest.fn().mockImplementationOnce(() => ({
			populate: jest.fn().mockImplementationOnce(() => ({
				sort: jest.fn().mockImplementationOnce(() => ({
					skip: jest.fn().mockImplementationOnce(() => ({
						limit: jest.fn().mockImplementationOnce(() => ({
							lean: jest.fn().mockResolvedValueOnce([]),
						})),
					})),
				})),
			})),
		}));
		Post.count = jest.fn().mockResolvedValueOnce(0);
		const response = await request(app)
			.get('/api/home/feeds')
			.set('Authorization', 'Bearer Token');
		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				hasNext: false,
				hasPrev: false,
				posts: [],
			},
			error: '',
		});
	});
});
