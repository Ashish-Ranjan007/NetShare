import express from 'express';
import {
	clearNotifications,
	getNotificationHistory,
	getNotifications,
} from '../controllers/notifications.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const notificationsRoute = express.Router();

notificationsRoute.get('/', [isAuthenticated], getNotifications);
notificationsRoute.get('/history', [isAuthenticated], getNotificationHistory);
notificationsRoute.post('/clear-all', [isAuthenticated], clearNotifications);

export { notificationsRoute };
