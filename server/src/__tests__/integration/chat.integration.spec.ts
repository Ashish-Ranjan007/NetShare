import request from 'supertest';

import { app } from '../../app';
import { User } from '../../models/User.model';
import { Chat } from '../../models/Chat.model';
import * as VerifyToken from '../../utils/verifyJWT';

// mocks
jest.mock('../../utils/verifyJWT');
jest.mock('../../models/User.model');
jest.mock('../../models/Chat.model');

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

describe('Integration tests for fetching chats of an user route', () => {
	it('GET /api/chats/ - success - fetch all chats user is involved in', async () => {
		Chat.count = jest.fn().mockResolvedValueOnce(0);
		Chat.find = jest.fn().mockImplementationOnce(() => ({
			sort: jest.fn().mockImplementationOnce(() => ({
				skip: jest.fn().mockImplementationOnce(() => ({
					limit: jest.fn().mockImplementationOnce(() => ({
						populate: jest.fn().mockResolvedValueOnce([]),
					})),
				})),
			})),
		}));

		const response = await request(app)
			.get('/api/chats')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				hasPrev: false,
				hasNext: false,
				chats: [],
			},
			error: '',
		});
	});
});

describe('Integration tests for creating a peer-to-peer chat route', () => {
	it('POST /api/chats/create-chat - success - create a peer-to-peer chat', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: '_id',
				username: 'username',
				profilePic: 'profilePic',
				friends: [
					{
						id: 'userId',
						username: 'username',
						profilePic: 'profilePic',
					},
				],
			});
		Chat.find = jest.fn().mockResolvedValueOnce([]);
		Chat.create = jest.fn().mockImplementationOnce((arg) => arg);

		const response = await request(app)
			.post('/api/chats/create-chat')
			.set('Authorization', 'Bearer Token')
			.send({ targetId: 'targetId' });

		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			success: true,
			data: {
				chat: {
					isGroup: false,
					name: 'direct message',
					members: [
						{
							id: 'userId',
							profilePic: 'profilePic',
							username: 'username',
						},
						{
							id: '_id',
							profilePic: 'profilePic',
							username: 'username',
						},
					],
					unreadMessages: [
						{
							newMessages: 0,
							userId: 'userId',
						},
						{
							newMessages: 0,
							userId: '_id',
						},
					],
				},
			},
			error: '',
		});
	});

	it('POST /api/chats/create-chat - success - if a chat already exist for both users return chat', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: '_id',
				username: 'username',
				profilePic: 'profilePic',
				friends: [
					{
						id: 'userId',
						username: 'username',
						profilePic: 'profilePic',
					},
				],
			});
		Chat.find = jest.fn().mockResolvedValueOnce([{}]);
		Chat.create = jest.fn().mockImplementationOnce((arg) => arg);

		const response = await request(app)
			.post('/api/chats/create-chat')
			.set('Authorization', 'Bearer Token')
			.send({ targetId: 'targetId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: { chat: {} },
			error: '',
		});
	});

	it('POST /api/chats/create-chat - failure if targetId is not provided', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: '_id',
				username: 'username',
				profilePic: 'profilePic',
			});

		const response = await request(app)
			.post('/api/chats/create-chat')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No userId is provided');
	});

	it('POST /api/chats/create-chat - failure if targetUser does not exist', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce(null);

		const response = await request(app)
			.post('/api/chats/create-chat')
			.set('Authorization', 'Bearer Token')
			.send({ targetId: 'targetId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid userId');
	});

	it('POST /api/chats/create-chat - failure if targetUser is not a friend', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: '_id',
				username: 'username',
				profilePic: 'profilePic',
				friends: [],
			});

		const response = await request(app)
			.post('/api/chats/create-chat')
			.set('Authorization', 'Bearer Token')
			.send({ targetId: 'targetId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Can only chat with friends');
	});
});

describe('Integration tests for creating a group chat route', () => {
	it('POST /api/chats/create-group-chat - success - create a group chat', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: '63a29bb60eeb6c7e7e415c42',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: '63a29bb60eeb6c7e7e415c48',
				username: 'username',
				profilePic: 'profilePic',
				friends: [
					{
						id: '63a29bb60eeb6c7e7e415c42',
						username: 'username',
						profilePic: 'profilePic',
					},
				],
			})
			.mockResolvedValueOnce({
				_id: '63a29bb60eeb6c7e7e415c49',
				username: 'username',
				profilePic: 'profilePic',
				friends: [
					{
						id: '63a29bb60eeb6c7e7e415c42',
						username: 'username',
						profilePic: 'profilePic',
					},
				],
			});
		Chat.create = jest.fn().mockImplementationOnce((arg) => arg);

		const response = await request(app)
			.post('/api/chats/create-group-chat')
			.set('Authorization', 'Bearer Token')
			.send({
				name: 'Test-Group',
				userIds: [
					'63a29bb60eeb6c7e7e415c48',
					'63a29bb60eeb6c7e7e415c49',
				],
				displayPictureUrl: 'displayPictureUrl',
			});

		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			success: true,
			data: {
				groupChat: {
					isGroup: true,
					name: 'Test-Group',
					members: [
						{
							id: '63a29bb60eeb6c7e7e415c48',
							username: 'username',
							profilePic: 'profilePic',
						},
						{
							id: '63a29bb60eeb6c7e7e415c49',
							username: 'username',
							profilePic: 'profilePic',
						},
						{
							id: '63a29bb60eeb6c7e7e415c42',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					createdBy: {
						id: '63a29bb60eeb6c7e7e415c42',
						username: 'username',
						profilePic: 'profilePic',
					},
					admins: [
						{
							id: '63a29bb60eeb6c7e7e415c42',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					displayPicture: 'displayPictureUrl',
					unreadMessages: [
						{
							newMessages: 0,
							userId: '63a29bb60eeb6c7e7e415c48',
						},
						{
							newMessages: 0,
							userId: '63a29bb60eeb6c7e7e415c49',
						},
						{
							newMessages: 0,
							userId: '63a29bb60eeb6c7e7e415c42',
						},
					],
				},
			},
			error: '',
		});
	});

	it('POST /api/chats/create-group-chat - failure if name or chat id is not provided', async () => {
		const response = await request(app)
			.post('/api/chats/create-group-chat')
			.set('Authorization', 'Bearer Token')
			.send({});

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({
			success: false,
			data: {},
			error: 'Invalid value',
		});
	});

	it('POST /api/chats/create-group-chat - failure if provided userIds string array is less than 2 or more than 19', async () => {
		const response = await request(app)
			.post('/api/chats/create-group-chat')
			.set('Authorization', 'Bearer Token')
			.send({ name: 'Test-Group', userIds: ['userId1'] });

		expect(response.statusCode).toBe(400);
		expect(response.body).toEqual({
			success: false,
			data: {},
			error: 'Provide an array of strings containing userIds of minimum 2 and maximum 19 elements',
		});
	});

	it('POST /api/chats/create-chat - failure if one of the provided userIds is not a friend', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: 'userId1',
				username: 'username',
				profilePic: 'profilePic',
				friends: [
					{
						id: 'userId',
						username: 'username',
						profilePic: 'profilePic',
					},
				],
			})
			.mockResolvedValueOnce({
				_id: 'userId2',
				username: 'username',
				profilePic: 'profilePic',
				friends: [],
			});
		Chat.create = jest.fn().mockImplementationOnce((arg) => arg);

		const response = await request(app)
			.post('/api/chats/create-group-chat')
			.set('Authorization', 'Bearer Token')
			.send({
				name: 'Test-Group',
				userIds: ['userId1', 'userId2'],
				displayPictureUrl: 'displayPictureUrl',
			});

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Can only add friends to a group');
	});
});

describe('Integration tests for renaming a group chat route', () => {
	it('POST /api/chats/rename-group - success - rename the provided group', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			name: 'Test Group',
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/rename-group')
			.set('Authorization', 'Bearer Token')
			.send({ newName: 'New Test Group', chatId: 'chatId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				groupChat: {
					isGroup: true,
					admins: [
						{
							id: 'userId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					name: 'New Test Group',
				},
			},
			error: '',
		});
	});

	it('POST /api/chats/rename-group - failure if newName or chatId is not provided', async () => {
		const response = await request(app)
			.post('/api/chats/rename-group')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Provide chatId and new name for the group chat'
		);
	});

	it('POST /api/chats/rename-group - failure if provided chatId is invalid', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.post('/api/chats/rename-group')
			.set('Authorization', 'Bearer Token')
			.send({ newName: 'New Test Group', chatId: 'chatId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Invalid chatId is provided');
	});

	it('POST /api/chats/rename-group - failure if current user is not an admin', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
			name: 'Test Group',
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/rename-group')
			.set('Authorization', 'Bearer Token')
			.send({ newName: 'New Test Group', chatId: 'chatId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Not authorized to perform this operation'
		);
	});
});

describe('Integration tests for adding a new member to group chat route', () => {
	it('POST /api/chats/add-member - success - add a new member to the group', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'currentUserId',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: 'userId',
				username: 'username',
				profilePic: 'profilePic',
				friends: [
					{
						id: 'currentUserId',
						username: 'username',
						profilePic: 'profilePic',
					},
				],
			});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			unreadMessages: [],
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/add-member')
			.set('Authorization', 'Berer Token')
			.send({ chatId: 'chatId', userId: 'userId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				groupChat: {
					isGroup: true,
					admins: [
						{
							id: 'currentUserId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					members: [
						{
							id: 'currentUserId',
							username: 'username',
							profilePic: 'profilePic',
						},
						{
							id: 'userId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					unreadMessages: [
						{
							newMessages: 0,
							userId: 'userId',
						},
					],
				},
			},
			error: '',
		});
	});

	it('POST /api/chats/add-member - failure if chatId or userId is not provided', async () => {
		const response = await request(app)
			.post('/api/chats/add-member')
			.set('Authorization', 'Berer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('chatId and userId is not provided');
	});

	it('POST /api/chats/add-member - failure if chatId or userId is invalid', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'currentUserId',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce(null);
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.post('/api/chats/add-member')
			.set('Authorization', 'Berer Token')
			.send({ chatId: 'chatId', userId: 'userId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Provided userId or chatId is invalid'
		);
	});

	it('POST /api/chats/add-member - failure if current user is not an admin', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'currentUserId',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: 'userId',
				username: 'username',
				profilePic: 'profilePic',
			});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
			members: [],
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/add-member')
			.set('Authorization', 'Berer Token')
			.send({ chatId: 'chatId', userId: 'userId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Not authorized to perform this operation'
		);
	});

	it('POST /api/chats/add-member - failure if provided user is not a friend', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'currentUserId',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: 'userId',
				username: 'username',
				profilePic: 'profilePic',
				friends: [],
			});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/add-member')
			.set('Authorization', 'Berer Token')
			.send({ chatId: 'chatId', userId: 'userId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Can only add friends to the group');
	});

	it('POST /api/chats/add-member - failure if provided user is already a member', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'currentUserId',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: 'userId',
				username: 'username',
				profilePic: 'profilePic',
				friends: [
					{
						id: 'currentUserId',
						username: 'username',
						profilePic: 'profilePic',
					},
				],
			});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/add-member')
			.set('Authorization', 'Berer Token')
			.send({ chatId: 'chatId', userId: 'userId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('User is already a group member');
	});
});

describe('Integration tests for removing a member from group chat route', () => {
	it('POST /api/chats/remove-member - success - remove the member from the group', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'memberId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			unreadMessages: [
				{ userId: 'userId', newMessages: 0 },
				{ userId: 'memberId', newMessages: 0 },
			],
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/remove-member')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', memberId: 'memberId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				groupChat: {
					isGroup: true,
					admins: [
						{
							id: 'userId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					members: [
						{
							id: 'userId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					unreadMessages: [{ userId: 'userId', newMessages: 0 }],
				},
			},
			error: '',
		});
	});

	it('POST /api/chats/remove-member - success - delete the groupChat if no users are remaining after removal', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			unreadMessages: [{ userId: 'id', newMessages: 0 }],
			save: jest.fn(),
			delete: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/remove-member')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', memberId: 'userId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('POST /api/chats/remove-member - success - make a member admin if no admins are remaining after removal', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'memberId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			unreadMessages: [
				{ userId: 'userId', newMessages: 0 },
				{ userId: 'memberId', newMessages: 0 },
			],
			save: jest.fn(),
			delete: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/remove-member')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', memberId: 'userId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				groupChat: {
					isGroup: true,
					admins: [
						{
							id: 'memberId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					members: [
						{
							id: 'memberId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					unreadMessages: [{ userId: 'memberId', newMessages: 0 }],
				},
			},
			error: '',
		});
	});

	it('POST /api/chats/remove-member - failure if chatId or memberId is not provided', async () => {
		const response = await request(app)
			.post('/api/chats/remove-member')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provide a chatId and memberId');
	});

	it('POST /api/chats/remove-member - failure if provided groupChat is invalid', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.post('/api/chats/remove-member')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', memberId: 'userId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provided chatId is invalid');
	});

	it('POST /api/chats/remove-member - failure if current user is not an admin', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
			members: [],
		});

		const response = await request(app)
			.post('/api/chats/remove-member')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', memberId: 'userId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Not authorized to perform this operation'
		);
	});

	it('POST /api/chats/remove-member - failure if provided member is an admin but is not the current user', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'memberId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'memberId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
		});

		const response = await request(app)
			.post('/api/chats/remove-member')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', memberId: 'memberId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Cannot remove an admin');
	});
});

describe('Integration tests for making a member admin route', () => {
	it('POST /api/chats/add-admin - success - make a member admin', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'currentUserId',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				_id: 'userId',
				username: 'username',
				profilePic: 'profilePic',
			});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/add-admin')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', userId: 'userId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				groupChat: {
					isGroup: true,
					admins: [
						{
							id: 'currentUserId',
							username: 'username',
							profilePic: 'profilePic',
						},
						{
							id: 'userId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					members: [
						{
							id: 'currentUserId',
							username: 'username',
							profilePic: 'profilePic',
						},
						{
							id: 'userId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
				},
			},
			error: '',
		});
	});

	it('POST /api/chats/add-admin - failure if chatId or userId are not provided', async () => {
		const response = await request(app)
			.post('/api/chats/add-admin')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provide chatId and userId');
	});

	it('POST /api/chats/add-admin - failure if provided chatId or userId is invalid', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'currentUserId',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce(null);
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.post('/api/chats/add-admin')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', userId: 'userId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Provided userId or chatId is invalid'
		);
	});

	it('POST /api/chats/add-admin - failure if current user is not an admin', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'currentUserId',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				id: 'userId',
				username: 'username',
				profilePic: 'profilePic',
			});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
			members: [],
		});

		const response = await request(app)
			.post('/api/chats/add-admin')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', userId: 'userId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Not authorized to perform this operation'
		);
	});

	it('POST /api/chats/add-admin - failure if provided user is not a group member', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'currentUserId',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				id: 'userId',
				username: 'username',
				profilePic: 'profilePic',
			});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
		});

		const response = await request(app)
			.post('/api/chats/add-admin')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', userId: 'userId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Admins of a group have to be members first'
		);
	});

	it('POST /api/chats/add-admin - failure if provided user is already an admin', async () => {
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'currentUserId',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				id: 'userId',
				username: 'username',
				profilePic: 'profilePic',
			});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'currentUserId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
		});

		const response = await request(app)
			.post('/api/chats/add-admin')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', userId: 'userId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provided userId is already an admin');
	});
});

describe('Integration tests for removing a member from admin route', () => {
	it('POST /api/chats/remove-admin - success - remove an admin', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'adminId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'adminId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/remove-admin')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', adminId: 'adminId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				groupChat: {
					isGroup: true,
					admins: [
						{
							id: 'userId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					members: [
						{
							id: 'userId',
							username: 'username',
							profilePic: 'profilePic',
						},
						{
							id: 'adminId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
				},
			},
			error: '',
		});
	});

	it('POST /api/chats/remove-admin - success - make a member admin if the admins array is emptied from removal', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
				{
					id: 'adminId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/remove-admin')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', adminId: 'userId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				groupChat: {
					isGroup: true,
					admins: [
						{
							id: 'adminId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					members: [
						{
							id: 'userId',
							username: 'username',
							profilePic: 'profilePic',
						},
						{
							id: 'adminId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
				},
			},
			error: '',
		});
	});

	it('POST /api/chats/remove-admin - failure if chatId or adminId are not provided', async () => {
		const response = await request(app)
			.post('/api/chats/remove-admin')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provide chatId and adminId');
	});

	it('POST /api/chats/remove-admin - failure if provided chatId is invalid', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.post('/api/chats/remove-admin')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', adminId: 'adminId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provided chatId is invalid');
	});

	it('POST /api/chats/remove-admin - failure if current user is not an admin', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
		});

		const response = await request(app)
			.post('/api/chats/remove-admin')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', adminId: 'adminId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Not authorized to perform this operation'
		);
	});
});

describe('Integration tests for setting a display picture route', () => {
	it('POST /api/chats/set-display-picture - success - set display picture of the group', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			displayPicture: '',
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/chats/set-display-picture')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', displayPictureUrl: 'displayPictureUrl' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				groupChat: {
					isGroup: true,
					admins: [
						{
							id: 'userId',
							username: 'username',
							profilePic: 'profilePic',
						},
					],
					displayPicture: 'displayPictureUrl',
				},
			},
			error: '',
		});
	});

	it('POST /api/chats/set-display-picture - failure if chatId or displayPictureUrl is not provided', async () => {
		const response = await request(app)
			.post('/api/chats/set-display-picture')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Provide chatId and displayPicture url'
		);
	});

	it('POST /api/chats/set-display-picture - failure if provided chatId is invalid', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.post('/api/chats/set-display-picture')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', displayPictureUrl: 'displayPictureUrl' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provided chatId is invalid');
	});

	it('POST /api/chats/set-display-picture - failure if current user is not an admin', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
		});

		const response = await request(app)
			.post('/api/chats/set-display-picture')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId', displayPictureUrl: 'displayPictureUrl' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Not authorized to perform this operation'
		);
	});
});

describe('Integration tests for deleting a peer-to-peer chat route', () => {
	it('DELETE /api/chats/delete-chat - success - delete the direct message chat', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			delete: jest.fn(),
		});

		const response = await request(app)
			.delete('/api/chats/delete-chat')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('DELETE /api/chats/delete-chat - failure if provided chatId is invalid', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		const response = await request(app)
			.delete('/api/chats/delete-chat')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provided chatId is invalid');
	});

	it('DELETE /api/chats/delete-chat - failure if current user is not a member of the chat', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: false,
			members: [],
		});

		const response = await request(app)
			.delete('/api/chats/delete-chat')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Only members are authorized for this operation'
		);
	});
});

describe('Integration tests for deleting a group chat route', () => {
	it('DELETE /api/chats/delete-group-chat - success - delete the direct message chat', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			delete: jest.fn(),
		});

		const response = await request(app)
			.delete('/api/chats/delete-group-chat')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('DELETE /api/chats/delete-group-chat - failure if provided chatId is invalid', async () => {
		const response = await request(app)
			.delete('/api/chats/delete-group-chat')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Provided chatId is invalid');
	});

	it('DELETE /api/chats/delete-group-chat - failure if current user is not an admin of the chat', async () => {
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
		});

		const response = await request(app)
			.delete('/api/chats/delete-group-chat')
			.set('Authorization', 'Bearer Token')
			.send({ chatId: 'chatId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe(
			'Not authorized to perform this operation'
		);
	});
});
