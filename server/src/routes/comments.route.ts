import express from 'express';
import {
	deleteComment,
	getComment,
	getReplies,
	likeComment,
	replyOnComment,
	unlikeComment,
	updateComment,
} from '../controllers/comments.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const commentsRoute = express.Router();

commentsRoute.get('/comment', [isAuthenticated], getComment);
commentsRoute.get('/replies', [isAuthenticated], getReplies);
commentsRoute.post('/like', [isAuthenticated], likeComment);
commentsRoute.post('/unlike', [isAuthenticated], unlikeComment);
commentsRoute.post('/reply', [isAuthenticated], replyOnComment);
commentsRoute.post('/update', [isAuthenticated], updateComment);
commentsRoute.delete('/delete', [isAuthenticated], deleteComment);

export { commentsRoute };
