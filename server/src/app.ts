import cors from 'cors';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { homeRoute } from './routes/home';
import { authRoute } from './routes/auth';
import { error } from './middlewares/error';

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

// Error handling
app.use(error);

export { app };
