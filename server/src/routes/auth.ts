import express from 'express';

import {
	login,
	logout,
	register,
	refreshToken,
	getUserDetails,
	getSearchUsers,
	postAddRecentSearch,
	follow,
	unFollow,
	getFollowers,
	getFollowings,
	getFriends,
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
authRoute.get('/search', [isAuthenticated], getSearchUsers);
authRoute.post('/add-recent-search', [isAuthenticated], postAddRecentSearch);
authRoute.post('/follow', [isAuthenticated], follow);
authRoute.get('/friends', [isAuthenticated], getFriends);
authRoute.post('/unfollow', [isAuthenticated], unFollow);
authRoute.get('/followers', [isAuthenticated], getFollowers);
authRoute.get('/followings', [isAuthenticated], getFollowings);

export { authRoute };
