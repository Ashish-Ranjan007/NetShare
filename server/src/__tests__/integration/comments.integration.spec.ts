import request from 'supertest';

import { app } from '../../app';
import { User } from '../../models/User.model';
import { Post } from '../../models/Post.model';
import { Reply } from '../../models/Reply.model';
import { Comment } from '../../models/Comment.model';
import * as VerifyToken from '../../utils/verifyJWT';

// mocks
jest.mock('../../utils/verifyJWT');
jest.mock('../../utils/sendToken');
jest.mock('../../models/User.model');
jest.mock('../../models/Post.model');
jest.mock('../../models/Reply.model');
jest.mock('../../models/Comment.model');

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

describe('Integration tests for like comments route', () => {
	it('POST /api/comments/like - success - like a comment', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce({
			_id: 'commentId',
			likedBy: [],
			likes: 0,
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				notificationCount: 0,
				notifications: [],
				save: jest.fn(),
			});
		const response = await request(app)
			.post('/api/comments/like')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });
		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('POST /api/comments/like - failure if no commentId is provided', async () => {
		const response = await request(app)
			.post('/api/comments/like')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No comment is provided');
	});

	it('POST /api/comments/like - failure if provided commentId is invalid', async () => {
		const response = await request(app)
			.post('/api/comments/like')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('POST /api/comments/like - failure if comment is already liked', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce({
			likedBy: ['userId'],
		});

		const response = await request(app)
			.post('/api/comments/like')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Comment is already liked');
	});

	it('POST /api/comments/like - failure if creator of comment does not exist', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce({
			likedBy: [],
			likes: 0,
			createdBy: { id: 'id' },
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
			})
			.mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/comments/like')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Creator of comment does not exist');
	});
});

describe('Integration tests for unlike comments route', () => {
	it('POST /api/comments/unlike - success - unlike a comment', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce({
			likedBy: ['userId'],
			likes: 0,
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/comments/unlike')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('POST /api/comments/unlike - failure if no commentId is provided', async () => {
		const response = await request(app)
			.post('/api/comments/unlike')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No comment is provided');
	});

	it('POST /api/comments/unlike - failure if provided commentId is invalid', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/comments/unlike')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('POST /api/comments/unlike - failure if comment is not already liked', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce({
			likedBy: [],
		});

		const response = await request(app)
			.post('/api/comments/unlike')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Comment is not liked already.');
	});
});

describe('Integration tests for reply to comments route', () => {
	it('POST /api/comments/reply - success - reply to a comment', async () => {
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
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce({
				notificationCount: 0,
				notifications: [],
				save: jest.fn(),
			});

		const response = await request(app)
			.post('/api/comments/reply')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId', content: 'content' });

		expect(response.statusCode).toBe(201);
	});

	it('POST /api/comments/reply - failure if no commentId or content is provided', async () => {
		const response = await request(app)
			.post('/api/comments/reply')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Bad Request');
	});

	it('POST /api/comments/reply - failure if provided commentId is invalid', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/comments/reply')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId', content: 'content' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('POST /api/comments/reply - failure if creator of comment does not exist', async () => {
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			replies: [],
			repliesCount: 0,
			postId: 'postId',
			createdBy: { id: 'id' },
			save: jest.fn(),
		}));
		Reply.create = jest.fn().mockResolvedValueOnce({ _id: '_id' });
		Post.findById = jest.fn().mockResolvedValueOnce({
			commentsCount: 0,
			save: jest.fn(),
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
			})
			.mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/comments/reply')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId', content: 'content' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Creator of comment does not exist');
	});
});

describe('Integration tests for update comments route', () => {
	it('POST /api/comments/update - success - update a comment', async () => {
		User.findById = jest.fn().mockResolvedValueOnce({
			_id: 'userId',
			email: 'email',
			username: 'username',
			profilePic: 'profilePic',
		});
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce({
					likedBy: [],
					createdBy: {
						_id: 'userId',
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

		const response = await request(app)
			.post('/api/comments/update')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId', content: 'content' });

		expect(response.statusCode).toBe(200);
	});

	it('POST /api/comments/update - failure if no commentId or content is provided', async () => {
		const response = await request(app)
			.post('/api/comments/update')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Bad Request');
	});

	it('POST /api/comments/update - failure if provided commentId is invalid', async () => {
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce(null),
			})),
		}));

		const response = await request(app)
			.post('/api/comments/update')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId', content: 'content' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('POST /api/comments/update - failure if creator of comment is not user', async () => {
		Comment.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce({
					replies: [],
					repliesCount: 0,
					createdBy: { _id: 'id' },
					save: jest.fn(),
					content: '',
					updatedAt: Date.now(),
				}),
			})),
		}));

		const response = await request(app)
			.post('/api/comments/update')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId', content: 'content' });

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe('Unauthorized');
	});
});

describe('Integration tests for delete comments route', () => {
	it('DELETE /api/comments/delete - success - delete a comment', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce({
			createdBy: 'userId',
			delete: jest.fn(),
		});

		const response = await request(app)
			.delete('/api/comments/delete')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ success: true, data: {}, error: '' });
	});

	it('DELETE /api/comments/delete - failure if no commentId is provided', async () => {
		const response = await request(app)
			.delete('/api/comments/delete')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No comment is provided');
	});

	it('DELETE /api/comments/delete - failure if provided commentId is invalid', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.delete('/api/comments/delete')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('DELETE /api/comments/delete - failure if creator of comment is not user', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce({
			createdBy: { id: 'id' },
		});

		const response = await request(app)
			.delete('/api/comments/delete')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId', content: 'content' });

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe('Unauthorized');
	});
});

describe('Integration tests for getReplies of comments route', () => {
	it('GET /api/comments/replies - success - get replies of a comment', async () => {
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

		const response = await request(app)
			.get('/api/comments/replies/?commentId=commentId')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {
				hasPrev: false,
				hasNext: false,
				replies: [],
			},
			error: '',
		});
	});

	it('GET /api/comments/delete - failure if no commentId is provided', async () => {
		const response = await request(app)
			.get('/api/comments/replies/')
			.set('Authorization', 'Bearer token')
			.send({ commentId: 'commentId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toEqual('No comment is provided');
	});
});
