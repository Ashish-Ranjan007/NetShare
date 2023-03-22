import request from 'supertest';

import { app } from '../../app';
import { Post } from '../../models/Post.model';
import { User } from '../../models/User.model';
import { Comment } from '../../models/Comment.model';
import * as VerifyToken from '../../utils/verifyJWT';

// Mocks
jest.mock('../../utils/verifyJWT');
jest.mock('../../models/User.model');
jest.mock('../../models/Post.model');
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
	});
});

// Clean up
afterEach(() => {
	jest.resetAllMocks();
	jest.restoreAllMocks();
});

describe('Integration tests for create post route', () => {
	it('POST /api/posts/create - success - create a post', async () => {
		Post.create = jest.fn().mockResolvedValueOnce({ _id: '_id' });
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				profilePic: 'profilePic',
				username: 'username',
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockResolvedValueOnce({
					postsCount: 0,
					save: jest.fn(),
				}),
			}));
		const response = await request(app)
			.post('/api/posts/create')
			.set('Authorization', 'Bearer Token')
			.send({
				caption: 'caption',
				contents: [
					{ public_id: 'public_id', secure_url: 'secure_url' },
				],
			});
		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			success: true,
			data: { postId: '_id' },
			error: '',
		});
	});

	it('POST /api/posts/create - failure if no images are provided', async () => {
		const response = await request(app)
			.post('/api/posts/create')
			.set('Authorization', 'Bearer Token')
			.send({
				caption: 'caption',
				contents: [],
			});

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Please provide valid contents');
	});
});

describe('Integration tests for delete post route', () => {
	it('DELETE /api/posts/delete - success - delete a post', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce({
			createdBy: 'userId',
			delete: jest.fn(),
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'userId',
				email: 'email',
				username: 'username',
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockResolvedValueOnce({
					postsCount: 0,
					save: jest.fn(),
				}),
			}));

		const response = await request(app)
			.delete('/api/posts/delete')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('DELETE /api/posts/delete - failure if no postId is provided', async () => {
		const response = await request(app)
			.delete('/api/posts/delete')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No post is provided');
	});

	it('DELETE /api/posts/delete - failure if provided postId is invalid', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.delete('/api/posts/delete')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('DELETE /api/posts/delete - failure if user is not the creator of the post', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce({
			createdBy: { id: 'userId' },
			delete: jest.fn(),
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
			})
			.mockImplementationOnce(() => ({
				select: jest.fn().mockResolvedValueOnce({
					postsCount: 0,
					save: jest.fn(),
				}),
			}));

		const response = await request(app)
			.delete('/api/posts/delete')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(401);
		expect(response.body.error).toBe('Unauthorized');
	});
});

describe('Integration tests for get posts by id route', () => {
	it('GET /api/posts/by-id - success - send back a post', async () => {
		User.findById = jest.fn().mockResolvedValueOnce({
			_id: 'userId',
			email: 'email',
			username: 'username',
		});
		Post.find = jest.fn().mockImplementationOnce(() => ({
			populate: jest.fn().mockImplementationOnce(() => ({
				lean: jest
					.fn()
					.mockResolvedValueOnce([{ _id: '_id', likedBy: [] }]),
			})),
		}));

		const response = await request(app)
			.get('/api/posts/by-id/?postId=postId')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: { post: { _id: '_id', likedBy: [], isLiked: false } },
			error: '',
		});
	});

	it('GET /api/posts/by-id - failure if no postId is provided', async () => {
		const response = await request(app)
			.get('/api/posts/by-id/')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No post is provided');
	});

	it('GET /api/posts/by-id - failure if provided postId is invalid', async () => {
		Post.find = jest.fn().mockImplementationOnce(() => ({
			populate: jest.fn().mockImplementationOnce(() => ({
				lean: jest.fn().mockResolvedValueOnce([]),
			})),
		}));

		const response = await request(app)
			.get('/api/posts/by-id/?postId=postId')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});
});

describe('Integration tests for get posts by user route', () => {
	it('GET /api/posts/by-user - success - send back a post', async () => {
		User.exists = jest.fn().mockResolvedValueOnce({});
		Post.find = jest.fn().mockImplementationOnce(() => ({
			populate: jest.fn().mockImplementationOnce(() => ({
				sort: jest.fn().mockImplementationOnce(() => ({
					skip: jest.fn().mockImplementationOnce(() => ({
						limit: jest.fn().mockImplementationOnce(() => ({
							lean: jest.fn().mockResolvedValueOnce([]),
						})),
					})),
				})),
			})),
		}));

		const response = await request(app)
			.get('/api/posts/by-user/?userId=userId')
			.set('Authorization', 'Bearer Token')
			.send({ userId: 'userId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: { hasPrev: false, hasNext: false, posts: [] },
			error: '',
		});
	});

	it('GET /api/posts/by-user - failure if no postId is provided', async () => {
		const response = await request(app)
			.get('/api/posts/by-user/')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No user is provided');
	});

	it('GET /api/posts/by-user - failure if provided postId is invalid', async () => {
		User.exists = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.get('/api/posts/by-user/?userId=userId')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});
});

describe('Integration tests for like post route', () => {
	it('POST /api/posts/like- success - like a post', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce({
			_id: 'postId',
			likedBy: [],
			likes: 0,
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockResolvedValueOnce({
				notificationCount: 0,
				notifications: [],
				save: jest.fn(),
			});

		const response = await request(app)
			.post('/api/posts/like')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('POST /api/posts/like- failure if no postId is provided', async () => {
		const response = await request(app)
			.post('/api/posts/like')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No post is provided');
	});

	it('POST /api/posts/like- failure if provided postId is invalid', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/posts/like')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('POST /api/posts/like- failure if provided post is already liked', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce({
			_id: 'postId',
			likedBy: ['id'],
			likes: 0,
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				save: jest.fn(),
			})
			.mockResolvedValueOnce({
				notificationCount: 0,
				notifications: [],
				save: jest.fn(),
			});

		const response = await request(app)
			.post('/api/posts/like')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Post is already liked');
	});

	it('POST /api/posts/like- failure if creator of post does not exist', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce({
			_id: 'postId',
			likedBy: [],
			likes: 0,
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: 'id',
				email: 'email',
				username: 'username',
				profilePic: 'profilePic',
				notificationCount: 0,
				save: jest.fn(),
			})
			.mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/posts/like')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Creator of post does not exist');
	});
});

describe('Integration tests for unlike post route', () => {
	it('POST /api/posts/unlike - success - unlike a post', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce({
			likedBy: ['id'],
			likes: 0,
			createdBy: { id: 'id' },
			save: jest.fn(),
		});
		User.findById = jest.fn().mockResolvedValueOnce({
			_id: 'id',
			email: 'email',
			username: 'username',
			profilePic: 'profilePic',
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/posts/unlike')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: {},
			error: '',
		});
	});

	it('POST /api/posts/unlike- failure if no postId is provided', async () => {
		const response = await request(app)
			.post('/api/posts/unlike')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No post is provided');
	});

	it('POST /api/posts/unlike- failure if provided postId is invalid', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/posts/unlike')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});

	it('POST /api/posts/unlike- failure if provided post is not already liked', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce({
			likedBy: [],
			likes: 0,
			createdBy: { id: 'id' },
			save: jest.fn(),
		});

		const response = await request(app)
			.post('/api/posts/unlike')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId' });

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Post is not liked already.');
	});
});

describe('Integration tests for comment on a post route', () => {
	it('POST /api/posts/comment- success - comment on a post', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce({
			_id: 'postId',
			comments: [],
			createdBy: { _id: '_id' },
			commentsCount: 0,
			save: jest.fn(),
		});
		Comment.create = jest.fn().mockImplementationOnce(function (arg) {
			return {
				_id: '_id',
				populate: jest
					.fn()
					.mockImplementationOnce(function (this: any) {
						this.createdBy = {
							_id: arg.createdBy,
							username: 'username',
							profilePic: 'profilePic',
						};
					}),
			};
		});
		User.findById = jest
			.fn()
			.mockResolvedValueOnce({
				_id: '_id',
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
			.post('/api/posts/comment')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId', content: 'content' });

		expect(response.statusCode).toBe(201);
		expect(response.body).toEqual({
			success: true,
			data: {
				comment: {
					_id: '_id',
					createdBy: {
						_id: '_id',
						username: 'username',
						profilePic: 'profilePic',
					},
				},
			},
			error: '',
		});
	});

	it('POST /api/posts/comment- failure if no postId or content is provided', async () => {
		Post.findById = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.post('/api/posts/comment')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('Bad Request');
	});

	it('POST /api/posts/comment- failure if provided postId is invalid', async () => {
		const response = await request(app)
			.post('/api/posts/comment')
			.set('Authorization', 'Bearer Token')
			.send({ postId: 'postId', content: 'content' });

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});
});

describe('Integration tests for comment on a post route', () => {
	it('GET /api/posts/comments- success - send comments of a post', async () => {
		Post.exists = jest.fn().mockResolvedValueOnce({});
		Post.findById = jest.fn().mockImplementationOnce(() => ({
			select: jest.fn().mockImplementationOnce(() => ({
				sort: jest.fn().mockImplementationOnce(() => ({
					then: jest.fn().mockResolvedValueOnce([]),
				})),
			})),
		}));
		Comment.find = jest.fn().mockImplementationOnce(() => ({
			populate: jest.fn().mockImplementationOnce(() => ({
				sort: jest.fn().mockImplementationOnce(() => ({
					lean: jest.fn().mockResolvedValueOnce([]),
				})),
			})),
		}));

		const response = await request(app)
			.get('/api/posts/comments/?postId=postId')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual({
			success: true,
			data: { hasPrev: false, hasNext: false, comments: [] },
			error: '',
		});
	});

	it('GET /api/posts/comments- failure if no postId or content is provided', async () => {
		const response = await request(app)
			.get('/api/posts/comments/')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(400);
		expect(response.body.error).toBe('No post is provided');
	});

	it('GET /api/posts/comments- failure if provided postId is invalid', async () => {
		Post.exists = jest.fn().mockResolvedValueOnce(false);

		const response = await request(app)
			.get('/api/posts/comments/?postId=postId')
			.set('Authorization', 'Bearer Token');

		expect(response.statusCode).toBe(404);
		expect(response.body.error).toBe('Resource does not exist');
	});
});
