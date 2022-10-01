import { NextFunction, Request, Response } from 'express';

import { User } from '../../../models/User';
import * as VerifyJWT from '../../../utils/verifyJWT';
import { ErrorHandler } from '../../../utils/ErrorHandler';
import { isAuthenticated } from '../../../middlewares/isAuthenticated';

// Mocks
jest.mock('../../../models/User');
jest.mock('../../../utils/verifyJWT');

const mockRequest = {
	headers: {
		authorization: '',
	},
	user: {},
} as Request;

const mockResponse = {} as Response;

const mockNext = jest.fn().mockImplementation(function (x) {
	return x;
}) as NextFunction;

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Check if request is authenticated', () => {
	it('should respond with a 401 status if accessToken does not exists in authorization header', async () => {
		await isAuthenticated(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Please Login to access this resource', 401)
		);
	});

	it('should respond with a 401 status if accessToken is invalid', async () => {
		mockRequest.headers.authorization = 'Bearer Token';

		(VerifyJWT.verifyJWT as any) = jest.fn().mockReturnValueOnce({
			payload: {},
			invalid: true,
		});

		await isAuthenticated(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Please Login to access this resource', 401)
		);
	});

	it('should respond with a 401 status if user object does not exists', async () => {
		mockRequest.headers.authorization = 'Bearer Token';

		(VerifyJWT.verifyJWT as any) = jest.fn().mockReturnValueOnce({
			payload: { _id: '_id' },
			invalid: false,
		});

		User.findById = jest.fn().mockResolvedValueOnce(null);

		await isAuthenticated(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Please Login to access this resource', 401)
		);
	});

	it('should have an user object property to the request object', async () => {
		mockRequest.headers.authorization = 'Bearer Token';

		(VerifyJWT.verifyJWT as any) = jest.fn().mockReturnValueOnce({
			payload: { _id: '_id' },
			invalid: false,
		});

		User.findById = jest.fn().mockResolvedValueOnce({
			username: 'username',
		});

		await isAuthenticated(mockRequest, mockResponse, mockNext);

		expect(mockRequest.user).toEqual({ username: 'username' });
	});
});
