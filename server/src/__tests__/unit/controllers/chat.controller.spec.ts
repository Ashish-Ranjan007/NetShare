import { NextFunction, Request, Response } from 'express';

import {
	addAdmin,
	addMember,
	createChat,
	createGroupChat,
	deleteChat,
	fetchAllChats,
	removeAdmin,
	removeMember,
	renameGroupChat,
	setDisplayPicture,
} from '../../../controllers/chat.controller';
import { Chat } from '../../../models/Chat.model';
import { User } from '../../../models/User.model';
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

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Fetch chats', () => {
	it('should return all the chats user is invloved in', async () => {
		mockRequest.query = {};
		const mockResponse: any = { status: jest.fn() };

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

		await fetchAllChats(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Create peer-to-peer chat', () => {
	it('should throw error if targetId is not provided', async () => {
		await createChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No userId is provided', 400)
		);
	});

	it('should throw error if targetUser does not exist', async () => {
		mockRequest.body = { targetId: 'targetId' };
		User.findById = jest.fn().mockResolvedValueOnce(null);

		await createChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Invalid userId', 400)
		);
	});

	it('should throw an error if provided targetUser is not a friend', async () => {
		mockRequest.body = { targetId: 'targetId' };
		User.findById = jest.fn().mockResolvedValueOnce({
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
			friends: [],
		});

		await createChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Can only chat with friends', 400)
		);
	});

	it('should return a status of 200 if chat already exist for both users', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { targetId: 'targetId' };
		User.findById = jest.fn().mockResolvedValueOnce({
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

		await createChat(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});

	it('should create a direct message chat and return a status code of 201', async () => {
		mockRequest.body = { targetId: 'targetId' };
		const mockResponse = { status: jest.fn() } as any;

		User.findById = jest.fn().mockResolvedValueOnce({
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

		await createChat(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(201);
	});
});

describe('Create a group chat', () => {
	it('should throw an error if an user provided is not a friend', async () => {
		mockRequest.body = {
			name: 'name',
			userIds: ['user1', 'user2', 'user3'],
		};
		User.findById = jest.fn().mockImplementation((x) => ({
			_id: x,
			username: 'username',
			profilePic: 'profilePic',
			friends: [],
		}));
		Chat.create = jest.fn().mockResolvedValueOnce({});

		await createGroupChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Can only add friends to a group', 400)
		);
	});

	it('should create a group chat and return a status code of 201', async () => {
		const mockResponse: any = { status: jest.fn() };
		const mockRequest = {
			body: {
				name: 'name',
				userIds: [
					'63a29bb60eeb6c7e7e415c42',
					'63a29bb60eeb6c7e7e415c48',
					'63a29bb60eeb6c7e7e415c49',
				],
			},
			user: {
				_id: '63a29bb60eeb6c7e7e415d42',
				username: 'username',
				profilePic: 'profilePic',
				friends: [
					{
						id: '63a29bb60eeb6c7e7e415c42',
						username: 'username',
						profilePic: 'profilePic',
					},
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
				],
			},
		} as Request;

		User.findById = jest.fn().mockImplementation((x) => ({
			_id: x,
			username: 'username',
			profilePic: 'profilePic',
			friends: [
				{
					id: '63a29bb60eeb6c7e7e415d42',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
		}));
		Chat.create = jest.fn().mockResolvedValueOnce({});

		await createGroupChat(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(201);
	});
});

describe('Rename group chat', () => {
	it('should throw an error if newName or chatId is not provided', async () => {
		await renameGroupChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler(
				'Provide chatId and new name for the group chat',
				400
			)
		);
	});

	it('should throw an error if provided chatId does not exist or is not a group chat', async () => {
		mockRequest.body = { newName: 'newName', chatId: 'chatId' };
		Chat.findById = jest.fn().mockResolvedValueOnce(null);
		await renameGroupChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Invalid chatId is provided', 400)
		);
	});

	it('should throw an error if current user is not an admin', async () => {
		mockRequest.body = { newName: 'newName', chatId: 'chatId' };
		Chat.findById = jest
			.fn()
			.mockResolvedValueOnce({ isGroup: true, admins: [] });
		await renameGroupChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Not authorized to perform this operation', 400)
		);
	});

	it('should rename the chat and return a status code of 200', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { newName: 'newName', chatId: 'chatId' };
		Chat.findById = jest.fn().mockResolvedValueOnce({
			name: 'name',
			save: jest.fn().mockResolvedValueOnce(null),
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
		});
		await renameGroupChat(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Add a new member', () => {
	it('should throw an error if chatId or userId is not provided', async () => {
		await addMember(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('chatId and userId is not provided', 400)
		);
	});

	it('should throw an error if user or groupChat does not exist', async () => {
		mockRequest.body = { chatId: 'chatId', userId: 'userId' };
		User.findById = jest.fn().mockResolvedValueOnce(null);
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		await addMember(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provided userId or chatId is invalid', 400)
		);
	});

	it('should throw an error if current user is not an admin', async () => {
		mockRequest.body = { chatId: 'chatId', userId: 'userId' };
		User.findById = jest.fn().mockResolvedValueOnce({});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
		});

		await addMember(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Not authorized to perform this operation', 400)
		);
	});

	it('should throw an error if user is not a friend', async () => {
		mockRequest.body = { chatId: 'chatId', userId: 'userId' };
		User.findById = jest.fn().mockResolvedValueOnce({
			friends: [],
		});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
		});

		await addMember(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Can only add friends to the group', 400)
		);
	});

	it('should throw an error if user is already a member', async () => {
		mockRequest.body = { chatId: 'chatId', userId: 'userId' };
		User.findById = jest.fn().mockResolvedValueOnce({
			friends: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
		});
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
		});

		await addMember(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('User is already a group member', 400)
		);
	});

	it('should add a new member and return a status of 200', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { chatId: 'chatId', userId: 'userId' };
		User.findById = jest.fn().mockResolvedValueOnce({
			_id: 'userId',
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
		Chat.findById = jest.fn().mockResolvedValueOnce({
			save: jest.fn(),
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [],
			unreadMessages: [],
		});

		await addMember(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Remove a member', () => {
	it('should throw an error if chatId or memberId is not provided', async () => {
		await removeMember(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provide a chatId and memberId', 400)
		);
	});

	it('should throw an error if provided groupChat is invalid', async () => {
		mockRequest.body = { chatId: 'chatId', memberId: 'memberId' };
		Chat.findById = jest.fn().mockResolvedValueOnce(null);
		await removeMember(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provided chatId is invalid', 400)
		);
	});

	it('should throw an error if current user is not an admin', async () => {
		mockRequest.body = { chatId: 'chatId', memberId: 'memberId' };
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
		});
		await removeMember(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Not authorized to perform this operation', 400)
		);
	});

	it('should throw an error if member is an admin but is not the current user', async () => {
		mockRequest.body = { chatId: 'chatId', memberId: 'memberId' };
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
			members: [],
		});

		await removeMember(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Cannot remove an admin', 400)
		);
	});

	it('should delete the groupChat if no users are remaining after removal', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { chatId: 'chatId', memberId: 'userId' };
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
			unreadMessages: [{ userId: 'userId', newMessage: 0 }],
			delete: jest.fn(),
		});

		await removeMember(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});

	it('should make a member admin if admin is emptied after removal', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { chatId: 'chatId', memberId: 'userId' };
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

		await removeMember(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Add an admin', () => {
	it('should throw an error if chatId or userId is not provided', async () => {
		await addAdmin(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provide chatId and userId', 400)
		);
	});

	it('should throw an error if provided user or chat is invalid', async () => {
		mockRequest.body = { userId: 'userId', chatId: 'chatId' };
		User.findById = jest.fn().mockResolvedValueOnce(null);
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		await addAdmin(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provided userId or chatId is invalid', 400)
		);
	});

	it('should throw an error if current user is not an admin', async () => {
		mockRequest.body = { userId: 'userId', chatId: 'chatId' };
		User.findById = jest.fn().mockResolvedValueOnce({});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
		});

		await addAdmin(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Not authorized to perform this operation', 400)
		);
	});

	it('should throw an error if provided user is not a group member', async () => {
		mockRequest.body = { userId: 'userId', chatId: 'chatId' };
		User.findById = jest.fn().mockResolvedValueOnce({});
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [
				{
					id: 'userId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			members: [],
		});

		await addAdmin(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Admins of a group have to be members first', 400)
		);
	});

	it('should throw an error if provided user is already an admin', async () => {
		mockRequest.body = { userId: 'userId', chatId: 'chatId' };
		User.findById = jest.fn().mockResolvedValueOnce({});
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
		});

		await addAdmin(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provided userId is already an admin', 400)
		);
	});

	it('should make the provided user an admin and return a status of 200', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { userId: 'memberId', chatId: 'chatId' };
		User.findById = jest.fn().mockResolvedValueOnce({
			id: 'memberId',
			username: 'username',
			profilePic: 'profilePic',
		});
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
					id: 'memberId',
					username: 'username',
					profilePic: 'profilePic',
				},
			],
			save: jest.fn(),
		});

		await addAdmin(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Remove an admin', () => {
	it('should throw an error if chatId or adminId are not provided', async () => {
		await removeAdmin(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provide chatId and adminId', 400)
		);
	});

	it('should throw an error if provided chatId is invalid', async () => {
		mockRequest.body = { chatId: 'chatId', adminId: 'adminId' };
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		await removeAdmin(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provided chatId is invalid', 400)
		);
	});

	it('should throw an error if current user is not an admin', async () => {
		mockRequest.body = { chatId: 'chatId', adminId: 'adminId' };
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
		});

		await removeAdmin(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Not authorized to perform this operation', 400)
		);
	});

	it('should make a member admin if admins array is emptied after removal', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { chatId: 'chatId', adminId: 'userId' };
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
			save: jest.fn(),
		});

		await removeAdmin(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});

	it('should return a status code of 200', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { chatId: 'chatId', adminId: 'adminId' };
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
			save: jest.fn(),
		});

		await removeAdmin(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Set display picture of a group', () => {
	it('should throw an error if chatId or displayPictureUrl is not provided', async () => {
		await setDisplayPicture(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provide chatId and displayPicture url', 400)
		);
	});

	it('should throw an error if provided chatId is invalid', async () => {
		mockRequest.body = {
			chatId: 'chatId',
			displayPictureUrl: 'displayPictureUrl',
		};
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		await setDisplayPicture(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provided chatId is invalid', 400)
		);
	});

	it('should throw an error if current user is not an admin', async () => {
		mockRequest.body = {
			chatId: 'chatId',
			displayPictureUrl: 'displayPictureUrl',
		};
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
		});

		await setDisplayPicture(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Not authorized to perform this operation', 400)
		);
	});

	it('should set the display picture url and return a status code of 200', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = {
			chatId: 'chatId',
			displayPictureUrl: 'displayPictureUrl',
		};
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

		await setDisplayPicture(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Delete a chat', () => {
	it('should throw an error if chatId is not provided', async () => {
		mockRequest.body = {};
		await deleteChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provide a chatId', 400)
		);
	});

	it('should throw an error if provided chatId is invalid', async () => {
		mockRequest.body = { chatId: 'chatId' };
		Chat.findById = jest.fn().mockResolvedValueOnce(null);

		await deleteChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Provided chatId is invalid', 400)
		);
	});

	it('should throw an error if provided chat is a gc and current user is not an admin', async () => {
		mockRequest.body = { chatId: 'chatId' };
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: true,
			admins: [],
		});

		await deleteChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Not authorized to perform this operation', 400)
		);
	});

	it('should throw an error if provided chat is a dm and current user is not a member', async () => {
		mockRequest.body = { chatId: 'chatId' };
		Chat.findById = jest.fn().mockResolvedValueOnce({
			isGroup: false,
			members: [],
		});

		await deleteChat(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler(
				'Only members are authorized for this operation',
				400
			)
		);
	});

	it('should delete the provided chat and return a status code of 200', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { chatId: 'chatId' };
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

		await deleteChat(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});
