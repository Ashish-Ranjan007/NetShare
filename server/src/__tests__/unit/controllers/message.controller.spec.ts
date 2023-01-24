import { NextFunction, Request, Response } from 'express';

import {
	deleteMessage,
	fetchMessages,
} from '../../../controllers/messages.controller';
import { Chat } from '../../../models/Chat.model';
import { Message } from '../../../models/Message.model';
import { ErrorHandler } from '../../../utils/ErrorHandler';

const mockRequest = {
	user: {
		_id: 'userId',
		username: 'username',
		profilePic: 'profilePic',
	},
	body: {},
} as Request;
const mockResponse = {} as Response;
const mockNext = jest.fn().mockImplementation(function (x) {
	return x;
}) as NextFunction;

// mocks
jest.mock('../../../models/User.model');
jest.mock('../../../models/Chat.model');
jest.mock('../../../models/Message.model');

describe('Fetch messages of a chat', () => {
	it('should throw an error if chatId is not provided', async () => {
		mockRequest.query = {};
		await fetchMessages(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provide a chatId', 400)
		);
	});

	it('should throw an error if provided chatId is invalid', async () => {
		mockRequest.query = { chatId: '6382dfe80a6e1ffcb2f52cce' };
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		await fetchMessages(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provided chatId is invalid', 400)
		);
	});

	it('should throw an error if current user is not a member of the chat', async () => {
		mockRequest.query = { chatId: '6382dfe80a6e1ffcb2f52cce' };
		Chat.findById = jest.fn().mockResolvedValueOnce({
			members: [],
		});

		await fetchMessages(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Not authorized to perform this operation', 400)
		);
	});

	it('should return a status of 200', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.query = { chatId: '6382dfe80a6e1ffcb2f52cce' };

		Chat.findById = jest.fn().mockResolvedValueOnce({
			members: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			totalMessages: 0,
		});
		Message.find = jest.fn().mockImplementationOnce(() => ({
			sort: jest.fn().mockImplementationOnce(() => ({
				skip: jest.fn().mockImplementationOnce(() => ({
					limit: jest.fn().mockImplementationOnce(() => ({
						populate: jest.fn().mockResolvedValueOnce([]),
					})),
				})),
			})),
		}));

		await fetchMessages(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Delete a message', () => {
	it('should throw an error if messageId is not provided', async () => {
		await deleteMessage(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provide a messageId', 400)
		);
	});

	it('should throw an error if provided messageId is invalid', async () => {
		mockRequest.body = { messageId: 'messageId' };
		Message.findById = jest.fn().mockResolvedValueOnce(null);

		await deleteMessage(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provided messageId is invalid', 400)
		);
	});

	it('should throw an error if current user is not the creator of the message', async () => {
		mockRequest.body = { messageId: 'messageId' };
		Message.findById = jest.fn().mockResolvedValueOnce({
			sender: {
				id: 'sender',
				username: 'username',
				profilePic: 'profilePic',
			},
		});

		await deleteMessage(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler(
				'Only creator of a message is authorized to delete it',
				400
			)
		);
	});

	it('should delete the message and return a status of 200', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { messageId: 'messageId' };
		Message.findById = jest.fn().mockResolvedValueOnce({
			sender: 'userId',
			delete: jest.fn(),
		});

		await deleteMessage(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});
