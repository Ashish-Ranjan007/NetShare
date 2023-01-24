import request from 'supertest';

import { app } from '../../app';
import { User } from '../../models/User.model';
import { Chat } from '../../models/Chat.model';
import { Message } from '../../models/Message.model';
import * as VerifyToken from '../../utils/verifyJWT';

// mocks
jest.mock('../../utils/verifyJWT');
jest.mock('../../models/User.model');
jest.mock('../../models/Chat.model');
jest.mock('../../models/Message.model');

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

describe('Integration tests for fetching the messages of a chat route', () => {
	it('GET /api/messages/ - success - fetch all the messages of the provided group', async () => {
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

		const response = await request(app)
			.get('/api/messages/?chatId=6382dfe80a6e1ffcb2f52cce')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				hasPrev: false,
				hasNext: false,
				messages: [],
			},
			error: '',
		});
	});

	it('GET /api/messages/ - failure if chatId is not provided', async () => {
		const response = await request(app)
			.get('/api/messages/')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provide a chatId');
	});

	it('GET /api/messages/ - failure if provided chatId is invalid', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.get('/api/messages/?chatId=6382dfe80a6e1ffcb2f52cce')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provided chatId is invalid');
	});

	it('GET /api/messages/ - failure if current user is not a member of the chat', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			members: [],
		});

		const response = await request(app)
			.get('/api/messages/?chatId=6382dfe80a6e1ffcb2f52cce')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Not authorized to perform this operation'
		);
	});
});

describe('Integration tests for deleting a message route', () => {
	it('DELETE /api/messages/delete - success - delete the provided message', async () => {
		Message.findById = jest.fn().mockResolvedValueOnce({
			sender: 'userId',
			delete: jest.fn(),
		});

		const response = await request(app)
			.delete('/api/messages/delete')
			.set('Authorization', 'Bearer Token')
			.send({ messageId: 'messageId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('DELETE /api/messages/delete - failure if messageId is not provided', async () => {
		const response = await request(app)
			.delete('/api/messages/delete')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provide a messageId');
	});

	it('DELETE /api/messages/delete - failure if provided messageId is invalid', async () => {
		Message.findById = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.delete('/api/messages/delete')
			.set('Authorization', 'Bearer Token')
			.send({ messageId: 'messageId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provided messageId is invalid');
	});

	it('DELETE /api/messages/delete - failure if current user is not the creator of the provided message', async () => {
		Message.findById = jest.fn().mockResolvedValueOnce({
			sender: {
				id: 'senderId',
				username: 'username',
				profilePic: 'profilePic',
			},
		});

		const response = await request(app)
			.delete('/api/messages/delete')
			.set('Authorization', 'Bearer Token')
			.send({ messageId: 'messageId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Only creator of a message is authorized to delete it'
		);
	});
});
