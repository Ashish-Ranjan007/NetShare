import express from 'express';

import {
	deleteMessage,
	fetchMessages,
} from '../controllers/messages.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const messageRoute = express.Router();

messageRoute.get('/', [isAuthenticated], fetchMessages);
messageRoute.delete('/delete', [isAuthenticated], deleteMessage);

export { messageRoute };
