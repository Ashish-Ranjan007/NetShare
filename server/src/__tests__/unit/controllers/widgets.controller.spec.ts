import { NextFunction, Request } from 'express';

import {
	getBirthdays,
	getSuggestProfiles,
} from '../../../controllers/widgets.controller';
import { User } from '../../../models/User.model';

// mocks
jest.mock('../../../models/User.model');

const mockRequest = { user: { _id: 'userId' } } as Request;
const mockResponse: any = { status: jest.fn() };
const mockNext = jest.fn().mockImplementation(function (x) {
	return { status: jest.fn() };
}) as NextFunction;

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Get Suggested Profile', () => {
	it('should return an array of profiles that user does not already follow', async () => {
		User.find = jest.fn().mockImplementationOnce(() => ({
			limit: jest.fn().mockResolvedValueOnce([
				{
					_id: 'friendId',
					username: 'username',
					profilePic: 'profilePic',
				},
			]),
		}));

		await getSuggestProfiles(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Get Birthdays', () => {
	it('should return friends who have birthday today', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				friends: [
					{
						id: 'friendId',
						username: 'friend',
						profilePic: 'profilePic',
					},
				],
			})
			.mockResolvedValueOnce({
				_id: 'friendId',
				username: 'friend',
				profilePic: 'profilePic',
				dateOfBirth: new Date(),
			});

		await getBirthdays(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});
