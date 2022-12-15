import { NextFunction, Request, Response } from 'express';

import { User } from '../../../models/User.model';
import { Post } from '../../../models/Post.model';
import { Reply } from '../../../models/Reply.model';
import { Comment } from '../../../models/Comment.model';
import { ErrorHandler } from '../../../utils/ErrorHandler';
import {
	deleteReply,
	likeReply,
	replyToReply,
	unlikeReply,
	updateReply,
} from '../../../controllers/reply.controller';

// mocks
jest.mock('../../../models/User.model');
jest.mock('../../../models/Reply.model');
jest.mock('../../../models/Comment.model');

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

describe('Like a reply', () => {
	it('should call next if no reply is provided', async () => {
		mockRequest.body = { commentId: false };
		await likeReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No replyId is provided', 400)
		);
	});

	it('should call next if replyId provided is not valid', async () => {
		mockRequest.body = { replyId: 'replyId' };
		Reply.findById = jest.fn().mockResolvedValueOnce(false);

		await likeReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if reply is already liked', async () => {
		mockRequest.user = { _id: 'userId' };
		mockRequest.body = { replyId: 'replyId' };
		Reply.findById = jest.fn().mockImplementationOnce(() => ({
			likedBy: ['userId'],
		}));

		await likeReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Reply is already liked', 400)
		);
	});

	it('should call next if creator of that reply does not exists', async () => {
		mockRequest.body = { replyId: 'replyId' };
		Reply.findById = jest.fn().mockResolvedValue({
			likedBy: [],
			likes: 0,
			createdBy: {
				id: 'id',
			},
		});
		User.findById = jest.fn().mockResolvedValue(false);

		await likeReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Creator of comment does not exist', 400)
		);
	});

	it('should return 201 status code', async () => {
		mockRequest.user = {
			_id: 'userId',
			username: 'username',
			profilePic: 'profilePic',
		};
		const mockResponse: any = { status: jest.fn() };
		mockRequest.body = { replyId: 'replyId' };
		Reply.findById = jest.fn().mockResolvedValue({
			_id: 'replyId',
			likedBy: [],
			likes: 0,
			createdBy: {
				id: 'id',
			},
			save: jest.fn(),
		});
		User.findById = jest.fn().mockResolvedValue({
			notificationCount: 0,
			notifications: [],
			save: jest.fn(),
		});

		await likeReply(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(201);
	});
});

describe('Unlike a reply', () => {
	it('should call next if no reply is provided', async () => {
		mockRequest.body = { commentId: false };
		await unlikeReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No replyId is provided', 400)
		);
	});

	it('should call next if replyId provided is not valid', async () => {
		mockRequest.body = { replyId: 'replyId' };
		Reply.findById = jest.fn().mockResolvedValueOnce(false);

		await unlikeReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if reply is not already liked', async () => {
		mockRequest.user = { _id: 'userId' };
		mockRequest.body = { replyId: 'replyId' };
		Reply.findById = jest.fn().mockImplementationOnce(() => ({
			likedBy: [],
		}));

		await unlikeReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Reply is not already liked', 400)
		);
	});

	it('should return 201 status code', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.user = { _id: 'userId' };
		mockRequest.body = { replyId: 'replyId' };
		Reply.findById = jest.fn().mockImplementationOnce(() => ({
			likedBy: ['userId'],
			likes: 0,
			save: jest.fn(),
		}));

		await unlikeReply(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Reply to a reply', () => {
	it('should call next if no commentId or replyId or content is provided', async () => {
		mockRequest.body = {
			commentId: false,
			replyId: 'replyId',
			content: '',
		};

		await replyToReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Bad Request', 400)
		);
	});

	it('should call next if provided commentId or replyId is invalid', async () => {
		mockRequest.body = {
			commentId: 'commentId',
			replyId: 'replyId',
			content: 'content',
		};
		Comment.findById = jest.fn().mockResolvedValueOnce({});
		Reply.findById = jest.fn().mockResolvedValueOnce(false);

		await replyToReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should create a new reply', async () => {
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = {
			commentId: 'commentId',
			replyId: 'replyId',
			content: 'content',
		};
		Comment.findById = jest.fn().mockResolvedValueOnce({});
		Reply.findById = jest.fn().mockResolvedValueOnce({
			createdBy: { username: 'username' },
		});
		Reply.create = jest.fn().mockResolvedValueOnce({});

		await replyToReply(mockRequest, mockResponse, mockNext);

		expect(Reply.create).toHaveBeenCalled();
	});

	it('should return a 201 status code', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = {
			commentId: 'commentId',
			replyId: 'replyId',
			content: 'content',
		};
		Comment.findById = jest.fn().mockResolvedValueOnce({
			_id: 'commentid',
			replies: [],
			repliesCount: 0,
			postId: 'postId',
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		Reply.findById = jest.fn().mockResolvedValueOnce({
			_id: 'replyId',
			createdBy: { username: 'username', id: 'id' },
		});
		Reply.create = jest.fn().mockImplementationOnce(() => ({
			_id: '_id',
		}));
		Post.findById = jest.fn().mockImplementationOnce(() => ({
			_id: '_id',
			commentsCount: 0,
			save: jest.fn(),
		}));
		User.findById = jest
			.fn()
			.mockImplementationOnce(() => ({
				notificationCount: 0,
				notifications: [],
				save: jest.fn(),
			}))
			.mockImplementationOnce(() => ({
				notificationCount: 0,
				notifications: [],
				save: jest.fn(),
			}));

		await replyToReply(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(201);
	});
});

describe('Update a reply', () => {
	it('should call next if no replyId or content is provided', async () => {
		mockRequest.body = { replyId: false, content: '' };

		await updateReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Bad Request', 400)
		);
	});

	it('should call next if provided replyId is invalid', async () => {
		mockRequest.body = { replyId: 'replyId', content: 'content' };
		Reply.findById = jest.fn().mockResolvedValueOnce(false);

		await updateReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if reply is not created by the authenticated user', async () => {
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = { replyId: 'replyId', content: 'content' };
		Reply.findById = jest.fn().mockResolvedValueOnce({
			createdBy: { id: 'id' },
		});

		await updateReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Unauthorized', 401)
		);
	});

	it('should update and save the reply', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = { replyId: 'replyId', content: 'content' };
		Reply.findById = jest.fn().mockResolvedValueOnce({
			content: '',
			updatedAt: null,
			createdBy: { id: '_id' },
			save: jest.fn(),
		});

		await updateReply(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Delete a reply', () => {
	it('should call next if no replyId is provided', async () => {
		mockRequest.body = { replyId: false, content: '' };

		await deleteReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No replyId is provided', 400)
		);
	});

	it('should call next if provided replyId is invalid', async () => {
		mockRequest.body = { replyId: 'replyId', content: 'content' };
		Reply.findById = jest.fn().mockResolvedValueOnce(false);

		await deleteReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if reply is not created by the authenticated user', async () => {
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = { replyId: 'replyId', content: 'content' };
		Reply.findById = jest.fn().mockResolvedValueOnce({
			createdBy: { id: 'id' },
		});

		await deleteReply(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Unauthorized', 401)
		);
	});

	it('should delete the reply', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = { replyId: 'replyId', content: 'content' };
		Reply.findById = jest.fn().mockResolvedValueOnce({
			createdBy: { id: '_id' },
			delete: jest.fn(),
		});

		await deleteReply(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});
