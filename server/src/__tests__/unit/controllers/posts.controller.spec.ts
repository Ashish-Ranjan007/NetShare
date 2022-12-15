import { NextFunction, Request } from 'express';

import { Post } from '../../../models/Post.model';
import { User } from '../../../models/User.model';
import {
	commentOnPost,
	createPost,
	deletePost,
	getComments,
	getPostById,
	getPostsByUser,
	likePost,
	unlikePost,
} from '../../../controllers/posts.controller';
import { Comment } from '../../../models/Comment.model';
import { ErrorHandler } from '../../../utils/ErrorHandler';

// mocks
jest.mock('../../../models/Post.model');
jest.mock('../../../models/User.model');
jest.mock('../../../models/Comment.model');

const mockRequest = {
	user: { _id: 'id', username: 'username', profilePic: 'profilePic' },
} as Request;
const mockResponse: any = { status: jest.fn() };
const mockNext = jest.fn().mockImplementation((x) => x) as NextFunction;

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Create a post', () => {
	it('should call next if no contents are provided', async () => {
		mockRequest.body = { contents: '', caption: '' };

		await createPost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Bad Request', 400)
		);
	});

	it('shoulds return a status of 200', async () => {
		mockRequest.body = {
			contents: [{ public_id: '', secure_url: '' }],
			caption: 'caption',
		};
		Post.create = jest
			.fn()
			.mockImplementationOnce(() => ({ postId: 'postId' }));
		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce({
				postsCount: 0,
				save: jest.fn(),
			}),
		}));

		await createPost(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(201);
	});
});

describe('Delete a post', () => {
	it('should call next if no postId is provided', async () => {
		mockRequest.body = { postId: '' };

		await deletePost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No post is provided', 400)
		);
	});

	it('should call next if provided postId is not valid', async () => {
		mockRequest.body = { postId: 'postId' };
		Post.findById = jest.fn().mockResolvedValueOnce(false);

		await deletePost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if user is not the creator of post', async () => {
		mockRequest.body = { postId: 'postId' };
		Post.findById = jest
			.fn()
			.mockResolvedValueOnce({ createdBy: { id: '_id' } });

		await deletePost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Unauthorized', 401)
		);
	});

	it('should return a status of 200', async () => {
		mockRequest.body = { postId: 'postId' };
		Post.findById = jest.fn().mockResolvedValueOnce({
			createdBy: { id: 'id' },
			delete: jest.fn(),
		});
		User.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockResolvedValueOnce({
				postsCount: 0,
				save: jest.fn(),
			}),
		}));

		await deletePost(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Get a post by postId', () => {
	it('should call next if no postId is provided', async () => {
		mockRequest.query = { postId: '' };

		await getPostById(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No post is provided', 400)
		);
	});

	it('should call next if provided postId is invalid', async () => {
		mockRequest.query = { postId: 'postId' };
		Post.find = jest.fn().mockImplementation(() => ({
			lean: jest.fn().mockResolvedValueOnce([]),
		}));

		await getPostById(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should return a status of 200', async () => {
		mockRequest.body = { user: { _id: 'userId' } };
		mockRequest.query = { postId: 'postId' };
		Post.find = jest.fn().mockImplementationOnce(() => ({
			lean: jest.fn().mockResolvedValueOnce([
				{
					likedBy: [],
				},
			]),
		}));

		await getPostById(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Get posts by userId', () => {
	it('should call next if no userId is provided', async () => {
		mockRequest.query = { userId: '' };

		await getPostsByUser(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No user is provided', 400)
		);
	});

	it('should call next if provided userId is invalid', async () => {
		mockRequest.query = { userId: 'userId' };
		User.exists = jest.fn().mockResolvedValueOnce(false);

		await getPostsByUser(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should return a status of 200', async () => {
		mockRequest.query = { userId: 'userId' };
		User.exists = jest.fn().mockResolvedValueOnce([]);
		Post.count = jest.fn().mockResolvedValueOnce(0);
		Post.find = jest.fn().mockImplementationOnce(() => ({
			sort: jest.fn().mockImplementationOnce(() => ({
				skip: jest.fn().mockImplementationOnce(() => ({
					limit: jest.fn().mockImplementationOnce(() => ({
						lean: () => [],
					})),
				})),
			})),
		}));

		await getPostsByUser(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Like a post', () => {
	it('should call next if no postId is provided', async () => {
		mockRequest.body = { postId: '' };

		await likePost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No post is provided', 400)
		);
	});

	it('should call next if provided postId is invalid', async () => {
		mockRequest.body = { postId: 'postId' };
		Post.findById = jest.fn().mockResolvedValueOnce(false);

		await likePost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if post is already liked', async () => {
		mockRequest.body = { postId: 'postId' };
		Post.findById = jest.fn().mockResolvedValueOnce({
			likedBy: ['id'],
		});

		await likePost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Post is already liked', 400)
		);
	});

	it('should call next if post creator does not exist', async () => {
		mockRequest.body = { postId: 'postId' };
		Post.findById = jest.fn().mockResolvedValueOnce({
			likedBy: ['_id'],
			liked: 0,
			createdBy: { id: '_id' },
		});
		User.findById = jest.fn().mockResolvedValueOnce(false);

		await likePost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Creator of post does not exist', 400)
		);
	});

	it('should return a status of 201', async () => {
		mockRequest.body = { postId: 'postId' };
		Post.findById = jest.fn().mockResolvedValueOnce({
			_id: 'postId',
			likedBy: ['_id'],
			liked: 0,
			createdBy: { id: '_id' },
			save: jest.fn(),
		});
		User.findById = jest.fn().mockResolvedValueOnce({
			notificationCount: 0,
			notifications: [],
			save: jest.fn(),
		});

		await likePost(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(201);
	});
});

describe('Unlike a post', () => {
	it('should call next if no postId is provided', async () => {
		mockRequest.body = { postId: '' };

		await unlikePost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No post is provided', 400)
		);
	});

	it('should call next if provided postId is invalid', async () => {
		mockRequest.body = { postId: 'postId' };
		Post.findById = jest.fn().mockResolvedValueOnce(false);

		await unlikePost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if post is not already liked', async () => {
		mockRequest.body = { postId: 'postId' };
		Post.findById = jest.fn().mockResolvedValueOnce({
			likedBy: ['_id'],
		});

		await unlikePost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Post is not liked already.', 400)
		);
	});

	it('should return a status of 200', async () => {
		mockRequest.body = { postId: 'postId' };
		Post.findById = jest.fn().mockResolvedValueOnce({
			likedBy: ['id'],
			likes: 0,
			save: jest.fn(),
		});

		await unlikePost(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(200);
	});
});

describe('Comment on a post', () => {
	it('should call next if postId or content is not provided', async () => {
		mockRequest.body = { contents: '', caption: '' };

		await commentOnPost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Bad Request', 400)
		);
	});

	it('should call next if provided postId is invalid', async () => {
		mockRequest.body = { postId: 'postId', content: 'content' };
		Post.findById = jest.fn().mockResolvedValueOnce(false);

		await commentOnPost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should call next if postCreator does not exists', async () => {
		mockRequest.body = { postId: 'postId', content: 'content' };
		Post.findById = jest.fn().mockResolvedValueOnce({
			comments: [],
			commentsCount: 0,
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		Comment.create = jest.fn().mockResolvedValueOnce({
			_id: '_id',
		});
		User.findById = jest.fn().mockResolvedValueOnce(false);

		await commentOnPost(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Creator of post does not exist', 400)
		);
	});

	it('should return a status of 201', async () => {
		mockRequest.body = { postId: 'postId', content: 'content' };
		Post.findById = jest.fn().mockResolvedValueOnce({
			_id: 'postId',
			comments: [],
			commentsCount: 0,
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		Comment.create = jest.fn().mockResolvedValueOnce({
			_id: '_id',
		});
		User.findById = jest.fn().mockResolvedValueOnce({
			notificationCount: 0,
			notifications: [],
			save: jest.fn(),
		});

		await commentOnPost(mockRequest, mockResponse, mockNext);

		expect(mockResponse.status).toHaveBeenCalledWith(201);
	});
});

describe('Get comments of a post', () => {
	it('should call next if postId is not provided', async () => {
		mockRequest.query = { postId: '' };

		await getComments(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('No post is provided', 400)
		);
	});

	it('should call next if provided postId is invalid', async () => {
		mockRequest.query = { postId: 'postId' };
		Post.exists = jest.fn().mockResolvedValueOnce(false);

		await getComments(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});

	it('should return a status of 200', async () => {
		mockRequest.query = { postId: 'postId' };
		Post.exists = jest.fn().mockResolvedValueOnce(false);
		Post.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				then: [],
			})),
		}));
		Comment.find = jest.fn().mockImplementationOnce(() => ({
			sort: jest.fn().mockResolvedValueOnce([]),
		}));

		await getComments(mockRequest, mockResponse, mockNext);

		expect(mockNext).toHaveBeenCalledWith(
			new ErrorHandler('Resource does not exist', 404)
		);
	});
});
