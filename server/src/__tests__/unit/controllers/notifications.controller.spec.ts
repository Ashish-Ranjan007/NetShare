import { NextFunction, Request } from 'express';

import {
	clearNotifications,
	getNotificationHistory,
	getNotifications,
} from '../../../controllers/notifications.controller';
import { User } from '../../../models/User.model';

// mocks
jest.mock('../../../models/User.model');

const mockRequest = { user: { _id: '_id' } } as Request;
const mockResponse: any = { status: jest.fn() };
const mockNext = jest.fn().mockImplementation((x) => x) as NextFunction;

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Get notifications', () => {
	it('should return a status of 200', async () => {
		mockRequest.query = { page: '0' };

		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				sort: jest.fn().mockImplementationOnce(() => ({
					then: () => [],
				})),
			})),
		}));

		await getNotifications(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Get notificationHistory', () => {
	it('should return a status of 200', async () => {
		mockRequest.query = { page: '0' };

		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				sort: jest.fn().mockImplementationOnce(() => ({
					then: () => [],
				})),
			})),
		}));

		await getNotificationHistory(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Clear notfications', () => {
	it('should return a status of 200', async () => {
		User.findById = jest.fn().mockResolvedValueOnce({
			notifications: [],
			notificationHistory: [],
			save: jest.fn(),
		});

		await clearNotifications(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});
