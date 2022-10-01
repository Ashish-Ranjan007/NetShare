import { NextFunction, Request, Response } from 'express';

import { User } from '../../../models/User';
import { sendToken } from '../../../utils/sendToken';
import * as VerifyJWT from '../../../utils/verifyJWT';
import { ErrorHandler } from '../../../utils/ErrorHandler';
import { login, refreshToken, register } from '../../../controllers/auth';

// Mocks
jest.mock('../../../models/User');
jest.mock('../../../utils/sendToken');
jest.mock('../../../utils/verifyJWT');

const mockRequest = {
	body: {
		email: 'fake@fake.com',
		password: 'fake',
	},
	cookies: { refreshToken: null },
} as Request;

let mockResponse = {} as Response;

const mockNext = jest.fn().mockImplementation(function (x) {
	return x;
}) as NextFunction;

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Register a new user', () => {
	it('should call next if email already exists', async () => {
		User.findOne = jest.fn().mockReturnValueOnce({ email: 'asdf' });

		await register(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Email already exists', 409)
		);
	});

	it('should call next if username already exists', async () => {
		User.findOne = jest
			.fn()
			.mockResolvedValueOnce(Promise.resolve(null))
			.mockResolvedValueOnce(Promise.resolve({ email: 'asdfadsf' }));

		await register(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Username already exists', 409)
		);
	});

	it('should call sendToken if username and email doesnt already exists', async () => {
		User.findOne = jest.fn().mockResolvedValueOnce(null);
		User.create = jest.fn().mockReturnValueOnce('x');

		await register(mockRequest, mockResponse, mockNext);

		expect(sendToken).toHaveBeenCalledWith('x', 201, mockResponse);
	});
});

describe('Login an existing user', () => {
	it('should call next if user object is empty', async () => {
		User.findOne = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce(null),
		}));

		await login(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Invalid Credentials', 401)
		);
	});

	it('should call next if isMatched is false', async () => {
		const mockedUserInstance = {
			matchPasswords: () => false,
		};

		User.findOne = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce(mockedUserInstance),
		}));

		await login(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Invalid Credentials', 401)
		);
	});

	it('should call sendToken if isMatched is true', async () => {
		const mockedUserInstance = {
			matchPasswords: () => true,
		};

		User.findOne = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce(mockedUserInstance),
		}));

		await login(mockRequest, mockResponse, mockNext);

		expect(sendToken).toHaveBeenCalledWith(
			mockedUserInstance,
			200,
			mockResponse
		);
	});
});

describe('Refresh token', () => {
	it('should call next if refreshToken does not exists in cookies', async () => {
		await refreshToken(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Unauthorized', 401)
		);
	});

	it('should call next if there exists no user with the provided refresh token', async () => {
		mockRequest.cookies.refreshToken = 'refresh';

		User.findOne = jest.fn().mockResolvedValueOnce(null);

		await refreshToken(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Please Login to access this resource', 401)
		);
	});

	it('should call next if the refreshToken is invalid or the payload does not exists', async () => {
		mockRequest.cookies.refreshToken = 'refresh';

		User.findOne = jest.fn().mockResolvedValueOnce('user');

		(VerifyJWT.verifyJWT as any) = jest.fn().mockResolvedValueOnce({
			payload: {},
			invalid: true,
		});

		await refreshToken(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Please Login to access this resource', 401)
		);
	});

	it('should call response.status if the refreshToken is valid', async () => {
		const newMockResponse: any = {
			status: jest.fn(),
		};

		mockRequest.cookies.refreshToken = 'refresh';

		User.findOne = jest.fn().mockResolvedValueOnce({
			getSignedToken: jest.fn().mockResolvedValueOnce('token'),
		});

		(VerifyJWT.verifyJWT as any) = jest.fn().mockReturnValueOnce({
			payload: { _id: '_id' },
			invalid: false,
		});

		await refreshToken(mockRequest, newMockResponse as Response, mockNext);

		expect(newMockResponse.status).toHaveBeenCalledWith(200);
	});
});
