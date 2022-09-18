import express from 'express';

import {
	login,
	logout,
	register,
	refreshToken,
	getUserDetails,
} from '../controllers/auth';
import { loginSchema } from '../validationSchema/loginValidator';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { registrationSchema } from '../validationSchema/registrationSchema';
import { validateRequestSchema } from '../middlewares/validateRequestSchema';

const authRoute = express.Router();

// Routes
authRoute.post(
	'/register',
	registrationSchema,
	validateRequestSchema,
	register
);
authRoute.post('/login', loginSchema, validateRequestSchema, login);
authRoute.post('/logout', [isAuthenticated], logout);
authRoute.get('/refresh-token', refreshToken);
authRoute.get('/whoami', [isAuthenticated], getUserDetails);

export { authRoute };
