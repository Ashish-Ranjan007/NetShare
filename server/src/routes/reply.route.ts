import express from 'express';

import {
	deleteReply,
	likeReply,
	replyToReply,
	unlikeReply,
	updateReply,
} from '../controllers/reply.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const replyRoute = express.Router();

replyRoute.post('/like', [isAuthenticated], likeReply);
replyRoute.post('/unlike', [isAuthenticated], unlikeReply);
replyRoute.post('/reply', [isAuthenticated], replyToReply);
replyRoute.post('/update', [isAuthenticated], updateReply);
replyRoute.delete('/delete', [isAuthenticated], deleteReply);

export { replyRoute };
