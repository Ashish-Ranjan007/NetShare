import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { error } from './middlewares/error';
import { homeRoute } from './routes/home.route';
import { authRoute } from './routes/auth.route';
import { postsRoute } from './routes/posts.route';
import { replyRoute } from './routes/reply.route';
import { commentsRoute } from './routes/comments.route';
import { notificationsRoute } from './routes/notifications.route';
import { settingsRoute } from './routes/settings.route';
import { widgetRoute } from './routes/widgets.route';

// Initialize express
const app = express();

// Apply middlewares
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use('/api/home', homeRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postsRoute);
app.use('/api/reply', replyRoute);
app.use('/api/widgets', widgetRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/comments', commentsRoute);
app.use('/api/notifications', notificationsRoute);

// Error handling
app.use(error);

export { app };
