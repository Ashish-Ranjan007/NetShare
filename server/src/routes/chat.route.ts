import express from 'express';

import {
	fetchAllChats,
	createChat,
	createGroupChat,
	renameGroupChat,
	addAdmin,
	addMember,
	removeAdmin,
	removeMember,
	setDisplayPicture,
	deleteChat,
} from '../controllers/chat.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { validateRequestSchema } from '../middlewares/validateRequestSchema';
import { createGroupSchema } from '../validationSchema/createGroupChatSchema';

const chatRoutes = express.Router();

chatRoutes.get('/', [isAuthenticated], fetchAllChats);
chatRoutes.post('/create-chat', [isAuthenticated], createChat);
chatRoutes.post(
	'/create-group-chat',
	[isAuthenticated],
	createGroupSchema,
	validateRequestSchema,
	createGroupChat
);
chatRoutes.post('/rename-group', [isAuthenticated], renameGroupChat);
chatRoutes.post('/add-member', [isAuthenticated], addMember);
chatRoutes.post('/remove-member', [isAuthenticated], removeMember);
chatRoutes.post('/add-admin', [isAuthenticated], addAdmin);
chatRoutes.post('/remove-admin', [isAuthenticated], removeAdmin);
chatRoutes.post('/set-display-picture', [isAuthenticated], setDisplayPicture);
chatRoutes.delete('/delete-chat', [isAuthenticated], deleteChat);
chatRoutes.delete('/delete-group-chat', [isAuthenticated], deleteChat);

export { chatRoutes };
