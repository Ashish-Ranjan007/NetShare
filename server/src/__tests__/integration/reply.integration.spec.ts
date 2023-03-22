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

describe('Integration tests for like reply route', () => {
	it('POST /api/reply/like - success - like a reply', async () => {
		Reply.findById = jest.fn().mockResolvedValueOnce({
			_id: 'replyid',
			likedBy: [],
			liked: 0,
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
			})
			.mockResolvedValueOnce({
				notificationCount: 0,
				notifications: [],
				save: jest.fn(),
			});
		const response = await request(app)
			.post('/api/reply/like')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });
		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('POST /api/reply/like - failure if no replyId is provided', async () => {
		const response = await request(app)
			.post('/api/reply/like')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No replyId is provided');
	});

	it('POST /api/reply/like - failure if provided replyId is invalid', async () => {
		const response = await request(app)
			.post('/api/reply/like')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('POST /api/reply/like - failure if reply is already liked', async () => {
		Reply.findById = jest.fn().mockResolvedValueOnce({
			likedBy: ['userId'],
		});

		const response = await request(app)
			.post('/api/reply/like')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Reply is already liked');
	});

	it('POST /api/reply/like - failure if creator of reply does not exist', async () => {
		Reply.findById = jest.fn().mockResolvedValueOnce({
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
			.post('/api/reply/like')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Creator of comment does not exist');
	});
});

describe('Integration tests for unlike reply route', () => {
	it('POST /api/reply/unlike - success - unlike a reply', async () => {
		Reply.findById = jest.fn().mockResolvedValueOnce({
			likedBy: ['userId'],
			liked: 0,
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
			})
			.mockResolvedValueOnce({
				notifications: [],
				save: jest.fn(),
			});

		const response = await request(app)
			.post('/api/reply/unlike')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('POST /api/reply/unlike - failure if no replyId is provided', async () => {
		const response = await request(app)
			.post('/api/reply/unlike')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No replyId is provided');
	});

	it('POST /api/reply/unlike - failure if provided replyId is invalid', async () => {
		const response = await request(app)
			.post('/api/reply/unlike')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('POST /api/reply/unlike - failure if reply is not already liked', async () => {
		Reply.findById = jest.fn().mockResolvedValueOnce({
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
			.post('/api/reply/unlike')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Reply is not already liked');
	});
});

describe('Integration tests for reply to reply route', () => {
	it('POST /api/reply/reply - success - reply to a reply', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce({
			_id: 'commentid',
			replies: [],
			repliesCount: 0,
			postId: 'postId',
			createdBy: 'id',
			save: jest.fn(),
		});
		Reply.findById = jest.fn().mockResolvedValueOnce({
			_id: 'replyid',
			createdBy: 'id',
		});
		Reply.create = jest.fn().mockImplementationOnce(() => ({
			_id: '_id',
			repliedTo: {
				replyId: 'replyId',
				username: 'username',
			},
			populate: jest.fn(),
			save: jest.fn(),
		}));
		Post.findById = jest.fn().mockImplementationOnce(() => ({
			_id: 'postid',
			commentsCount: 0,
			save: jest.fn(),
		}));
		User.findById = jest
			.fn()
			.mockImplementationOnce(() => ({
				_id: 'userId',
				email: 'email',
				username: 'username',
			}))
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

		const response = await request(app)
			.post('/api/reply/reply')
			.set('Authorization', 'Bearer token')
			.send({
				commentId: 'commentId',
				replyId: 'replyId',
				content: 'content',
			});

		expect(response.statusCode).toBe(201);
	});

	it('POST /api/reply/reply - failure if no replyId or content is provided', async () => {
		const response = await request(app)
			.post('/api/reply/reply')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Bad Request');
	});

	it('POST /api/reply/reply - failure if provided replyId is invalid', async () => {
		Reply.findById = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/reply/reply')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Bad Request');
	});

	it('POST /api/reply/reply - failure if creator of reply does not exist', async () => {
		Comment.findById = jest.fn().mockResolvedValueOnce({
			replies: [],
			repliesCount: 0,
			postId: 'postId',
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		Reply.findById = jest.fn().mockResolvedValueOnce({
			createdBy: { username: 'username', id: 'id' },
		});
		Reply.create = jest.fn().mockImplementationOnce(() => ({
			_id: '_id',
		}));
		Post.findById = jest.fn().mockImplementationOnce(() => ({
			commentsCount: 0,
			save: jest.fn(),
		}));
		User.findById = jest
			.fn()
			.mockImplementationOnce(() => ({
				_id: 'userId',
				email: 'email',
				username: 'username',
			}))
			.mockImplementationOnce(() => false)
			.mockImplementationOnce(() => false);

		const response = await request(app)
			.post('/api/reply/reply')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Bad Request');
	});
});

describe('Integration tests for update reply route', () => {
	it('POST /api/reply/update - success - update a reply', async () => {
		Reply.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce({
					replies: [],
					repliesCount: 0,
					createdBy: { _id: 'userId' },
					content: '',
					updatedAt: null,
					save: jest.fn(),
				}),
			})),
		}));

		const response = await request(app)
			.post('/api/reply/update')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId', content: 'content' });

		expect(response.statusCode).toBe(200);
	});

	it('POST /api/reply/update - failure if no replyId or content is provided', async () => {
		const response = await request(app)
			.post('/api/reply/update')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Bad Request');
	});

	it('POST /api/reply/update - failure if provided replyId is invalid', async () => {
		Reply.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				populate: jest.fn().mockResolvedValueOnce(false),
			})),
		}));

		const response = await request(app)
			.post('/api/reply/update')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId', content: 'content' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('POST /api/reply/update - failure if creator of reply is not user', async () => {
		Reply.findById = jest.fn().mockImplementationOnce(() => ({
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
			.post('/api/reply/update')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId', content: 'content' });

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe('Unauthorized');
	});
});

describe('Integration tests for delete reply route', () => {
	it('DELETE /api/reply/delete - success - delete a reply', async () => {
		Reply.findById = jest.fn().mockResolvedValueOnce({
			createdBy: 'userId',
			delete: jest.fn(),
		});

		const response = await request(app)
			.delete('/api/reply/delete')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({ success: true, data: {}, error: '' });
	});

	it('DELETE /api/reply/delete - failure if no replyId is provided', async () => {
		const response = await request(app)
			.delete('/api/reply/delete')
			.set('Authorization', 'Bearer token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No replyId is provided');
	});

	it('DELETE /api/reply/delete - failure if provided replyId is invalid', async () => {
		Reply.findById = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.delete('/api/reply/delete')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('DELETE /api/reply/delete - failure if creator of reply is not user', async () => {
		Reply.findById = jest.fn().mockResolvedValueOnce({
			createdBy: 'id',
		});

		const response = await request(app)
			.delete('/api/reply/delete')
			.set('Authorization', 'Bearer token')
			.send({ replyId: 'replyId' });

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe('Unauthorized');
	});
});
