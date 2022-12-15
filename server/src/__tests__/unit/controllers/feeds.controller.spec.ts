import { NextFunction, Request } from 'express';

import { Post } from '../../../models/Post.model';
import { User } from '../../../models/User.model';
import { getFeeds } from '../../../controllers/feeds.controller';
import { ErrorHandler } from '../../../utils/ErrorHandler';

// mocks
jest.mock('../../../models/User.model');
jest.mock('../../../models/Post.model');

const mockRequest = { user: { _id: '_id' } } as Request;
const mockResponse: any = { status: jest.fn() };
const mockNext = jest.fn().mockImplementation((x) => x) as NextFunction;

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Get feeds', () => {
	it('should call next if user is invalid', async () => {
		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce(false),
		}));

		await getFeeds(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Bad request', 404)
		);
	});

	it('should return a status of 200', async () => {
		mockRequest.query = { page: '0' };
		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce({
				friends: [],
				followings: [],
			}),
		}));
		Post.find = jest.fn().mockImplementationOnce(() => ({
			sort: jest.fn().mockImplementationOnce(() => ({
				skip: jest.fn().mockImplementationOnce(() => ({
					limit: jest.fn().mockImplementationOnce(() => ({
						lean: jest.fn().mockResolvedValueOnce([]),
					})),
				})),
			})),
		}));
		Post.count = jest.fn().mockResolvedValueOnce(0);

		await getFeeds(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});
