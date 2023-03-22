import { Request, Response, NextFunction } from 'express';

import {
	changePassword,
	deleteAccount,
	editProfile,
} from '../../../controllers/settings.controller';
import { User } from '../../../models/User.model';
import { ErrorHandler } from '../../../utils/ErrorHandler';

// mocks
jest.mock('../../../models/User.model');

const mockRequest = {} as Request;
const mockResponse = {} as Response;
const mockNext = jest.fn().mockImplementation(function (x) {
	return x;
}) as NextFunction;

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Edit Profile', () => {
	it('should call next if user is invalid', async () => {
		mockRequest.user = {
			_id: '_id',
		};
		mockRequest.body = {
			profilePic: 'profilePic',
			firstname: 'firstname',
			lastname: 'lastname',
			bio: 'bio',
			dateOfBirth: 'dateOfBirth',
			gender: 'male',
		};

		User.findById = jest.fn().mockImplementationOnce(() => ({
			populate: jest.fn().mockResolvedValueOnce(false),
		}));

		await editProfile(mockRequest, mockResponse, mockNext);
		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Invalid user', 400)
		);
	});

	it('should return a status of 200', async () => {
		mockRequest.user = {
			_id: '_id',
		};
		mockRequest.body = {
			profilePic: 'profilePic',
			firstname: 'firstname',
			lastname: 'lastname',
			bio: 'bio',
			dateOfBirth: 'dateOfBirth',
			gender: 'male',
		};
		const mockResponse: any = { status: jest.fn() };

		User.findById = jest.fn().mockImplementationOnce(() => ({
			populate: jest.fn().mockResolvedValueOnce({
				save: jest.fn(),
			}),
		}));

		await editProfile(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Change Password', () => {
	it('should be provided with an userId and passwords', async () => {
		mockRequest.body = {
			oldPassword: 'oldPassword',
			newPassword: 'newPassword',
		};

		await changePassword(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No userId or password is provided', 400)
		);
	});

	it('should call next if user is invalid', async () => {
		mockRequest.body = {
			userId: 'userId',
			oldPassword: 'oldPassword',
			newPassword: 'newPassword',
		};

		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce(false),
		}));

		await changePassword(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Invalid userId', 400)
		);
	});

	it('should call next if provided password is incorrect', async () => {
		mockRequest.body = {
			userId: 'userId',
			oldPassword: 'oldPassword',
			newPassword: 'newPassword',
		};

		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				matchPasswords: jest.fn().mockResolvedValueOnce(false),
			})),
		}));

		await changePassword(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Invalid Credentials', 400)
		);
	});

	it('should return a status of 200', async () => {
		mockRequest.body = {
			userId: 'userId',
			oldPassword: 'oldPassword',
			newPassword: 'newPassword',
		};
		const mockResponse: any = { status: jest.fn() };

		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				password: 'password',
				save: jest.fn(),
				matchPasswords: jest.fn().mockResolvedValueOnce(true),
			})),
		}));

		await changePassword(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Delete Account', () => {
	it('should be provided with an userId and password', async () => {
		mockRequest.body = {
			password: 'password',
		};

		await deleteAccount(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No userId or password is provided', 400)
		);
	});

	it('should call next if user is invalid', async () => {
		mockRequest.body = {
			userId: 'userId',
			password: 'password',
		};
		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce(false),
		}));

		await deleteAccount(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Invalid userId', 400)
		);
	});

	it('should call next if provided password is incorrect', async () => {
		mockRequest.body = {
			userId: 'userId',
			password: 'password',
		};
		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				matchPasswords: jest.fn().mockResolvedValueOnce(false),
			})),
		}));

		await deleteAccount(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Invalid Credentials', 401)
		);
	});

	it('should return a status of 200', async () => {
		mockRequest.body = {
			userId: 'userId',
			password: 'password',
		};
		const mockResponse: any = { status: jest.fn() };

		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				delete: jest.fn(),
				matchPasswords: jest.fn().mockResolvedValueOnce(true),
			})),
		}));

		await deleteAccount(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});
