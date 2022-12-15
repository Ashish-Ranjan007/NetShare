import express from 'express';

import {
	commentOnPost,
	createPost,
	deletePost,
	getComments,
	getPostById,
	getPostsByUser,
	getRandomPost,
	likePost,
	unlikePost,
} from '../controllers/posts.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { validateRequestSchema } from '../middlewares/validateRequestSchema';
import { createPostSchema } from '../validationSchema/createPostSchema';

const postsRoute = express.Router();

postsRoute.post(
	'/create',
	[isAuthenticated],
	createPostSchema,
	validateRequestSchema,
	createPost
);
postsRoute.post('/like', [isAuthenticated], likePost);
postsRoute.get('/by-id', [isAuthenticated], getPostById);
postsRoute.post('/unlike', [isAuthenticated], unlikePost);
postsRoute.delete('/delete', [isAuthenticated], deletePost);
postsRoute.get('/comments', [isAuthenticated], getComments);
postsRoute.get('/explore', [isAuthenticated], getRandomPost);
postsRoute.get('/by-user', [isAuthenticated], getPostsByUser);
postsRoute.post('/comment', [isAuthenticated], commentOnPost);

export { postsRoute };
