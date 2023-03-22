import { NextFunction, Request, Response } from 'express';

import {
	replyOnComment,
	deleteComment,
	getReplies,
	likeComment,
	unlikeComment,
	updateComment,
} from '../../../controllers/comments.controller';
import { User } from '../../../models/User.model';
import { Post } from '../../../models/Post.model';
import { Reply } from '../../../models/Reply.model';
import { Comment } from '../../../models/Comment.model';
import { ErrorHandler } from '../../../utils/ErrorHandler';

const mockRequest = {} as Request;
const mockResponse = {} as Response;
const mockNext = jest.fn().mockImplementation(function (x) {
	return x;
}) as NextFunction;

// mocks
jest.mock('../../../models/User.model');
jest.mock('../../../models/Reply.model');
jest.mock('../../../models/Comment.model');

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Like a comment', () => {
	it('should call next if no comment is provided', async () => {
		mockRequest.body = { commentId: false };
		await likeComment(mockRequest, mockResponse, mockNext);
		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No comment is provided', 400)
		);
	});

	it('should call next if commentId provided is not valid', async () => {
		mockRequest.body = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockResolvedValueOnce(false);

		await likeComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if comment is already liked', async () => {
		mockRequest.user = { _id: 'userId' };
		mockRequest.body = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			likedBy: ['userId'],
		}));

		await likeComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Comment is already liked', 400)
		);
	});

	it('should call next if creator of that comment does not exists', async () => {
		mockRequest.body = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockResolvedValue({
			likedBy: [],
			likes: 0,
			createdBy: {
				id: 'id',
			},
		});
		User.findById = jest.fn().mockResolvedValue(false);

		await likeComment(mockRequest, mockResponse, mockNext);

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
		mockRequest.body = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockResolvedValue({
			_id: 'commentId',
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

		await likeComment(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(201);
	});
});

describe('Unlike a comment', () => {
	it('should call next if no comment is provided', async () => {
		mockRequest.body = { commentId: false };
		await unlikeComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No comment is provided', 400)
		);
	});

	it('should call next if provided commentId is not valid', async () => {
		mockRequest.body = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockResolvedValueOnce(false);

		await unlikeComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if provided comment is not already liked', async () => {
		mockRequest.user = { _id: 'userId' };
		mockRequest.body = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			likedBy: [],
		}));

		await unlikeComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Comment is not liked already.', 400)
		);
	});

	it('should return 200 status code', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.user = { _id: 'userId' };
		mockRequest.body = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			likedBy: ['userId'],
			likes: 0,
			save: jest.fn(),
		}));

		await unlikeComment(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Reply on a comment', () => {
	it('should call next if no comment or content is provided', async () => {
		mockRequest.body = { commentId: false, content: '' };

		await replyOnComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Bad Request', 400)
		);
	});

	it('should call next if provided comment is invalid', async () => {
		mockRequest.body = { commentId: 'commentId', content: 'contentId' };
		Comment.findById = jest.fn().mockResolvedValueOnce(false);

		await replyOnComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should create a new reply as a comment', async () => {
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = { commentId: 'commentId', content: 'contentId' };
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			replies: [],
			repliesCount: 0,
			createdBy: 'id',
		}));
		Reply.create = jest.fn();

		await replyOnComment(mockRequest, mockResponse, mockNext);

		expect(Reply.create).toHaveBeenCalled();
	});

	it('should call next if creator of the comment does not exists', async () => {
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = { commentId: 'commentId', content: 'contentId' };
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			replies: [],
			repliesCount: 0,
			postId: 'postId',
			createdBy: 'id',
		}));
		Reply.create = jest.fn().mockResolvedValueOnce({ _id: '_id' });
		Post.findById = jest.fn().mockResolvedValueOnce({
			commentsCount: 0,
		});
		User.findById = jest.fn().mockResolvedValueOnce(false);

		await replyOnComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Creator of comment does not exist', 400)
		);
	});

	it('should save the comment and the creator of that comment', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = { commentId: 'commentId', content: 'contentId' };
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			_id: 'commentId',
			replies: [],
			repliesCount: 0,
			postId: 'postId',
			createdBy: 'id',
			save: jest.fn(),
		}));
		Reply.create = jest.fn().mockImplementationOnce(() => ({
			_id: '_id',
			populate: jest.fn().mockResolvedValueOnce({
				_id: '_id',
				username: 'username',
				profilePic: 'profilePic',
			}),
		}));
		Post.findById = jest.fn().mockResolvedValueOnce({
			commentsCount: 0,
			save: jest.fn(),
		});
		User.findById = jest.fn().mockImplementationOnce(() => ({
			notificationCount: 0,
			notifications: [],
			save: jest.fn(),
		}));

		await replyOnComment(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(201);
	});
});

describe('Update a comment', () => {
	it('should call next if no comment or content is provided', async () => {
		mockRequest.body = { commentId: false, content: '' };

		await updateComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Bad Request', 400)
		);
	});

	it('should call next if provided comment is invalid', async () => {
		mockRequest.body = { commentId: 'commentId', content: 'content' };
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce(null),
			})),
		}));

		await updateComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if comment is not created by the authenticated user', async () => {
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = { commentId: 'commentId', content: 'content' };
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce({
					createdBy: {
						_id: 'id',
						username: 'username',
						profilePic: 'profilePic',
					},
					content: '',
					updatedAt: new Date(),
					save: jest.fn(),
				}),
			})),
		}));

		await updateComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Unauthorized', 401)
		);
	});

	it('should update and save the comment', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.user = {
			_id: '_id',
			username: 'username',
			profilePic: 'profilePic',
		};
		mockRequest.body = { commentId: 'commentId', content: 'content' };
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce({
					likedBy: [],
					createdBy: {
						_id: '_id',
						username: 'username',
						profilePic: 'profilePic',
					},
					content: '',
					updatedAt: new Date(),
					save: jest.fn(),
					toObject: jest.fn(),
				}),
			})),
		}));

		await updateComment(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Delete a comment', () => {
	it('should call next if no commentId is provided', async () => {
		mockRequest.body = { commentId: '' };

		await deleteComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No comment is provided', 400)
		);
	});

	it('should call next if provided comment is invalid', async () => {
		mockRequest.body = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockResolvedValueOnce(false);

		await deleteComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if comment is not created by the authenticated user', async () => {
		mockRequest.user = { _id: '_id' };
		mockRequest.body = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockResolvedValueOnce({
			createdBy: 'id',
		});

		await deleteComment(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Unauthorized', 401)
		);
	});

	it('should delete the comment', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.user = { _id: '_id' };
		mockRequest.body = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockResolvedValueOnce({
			createdBy: '_id',
			delete: jest.fn(),
		});

		await deleteComment(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Get replies', () => {
	it('should call next if no comment is provided', async () => {
		mockRequest.query = { commentId: '' };

		await getReplies(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No comment is provided', 400)
		);
	});

	it('should call next if comment provided is invalid', async () => {
		mockRequest.query = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockResolvedValueOnce(false);

		await getReplies(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should return a status of 200', async () => {
		const mockResponse: any = { status: jest.fn() };
		mockRequest.query = { commentId: 'commentId' };
		Comment.findById = jest.fn().mockResolvedValueOnce({
			repliesCount: 0,
			replies: [],
		});
		Reply.find = jest.fn().mockImplementationOnce(() => ({
			populate: jest.fn().mockImplementationOnce(() => ({
				sort: jest.fn().mockImplementationOnce(() => ({
					lean: jest.fn().mockResolvedValueOnce([]),
				})),
			})),
		}));

		await getReplies(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});
