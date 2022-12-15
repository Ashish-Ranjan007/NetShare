import express from 'express';

import {
	changePassword,
	deleteAccount,
	editProfile,
} from '../controllers/settings.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';
import { editProfileSchema } from '../validationSchema/editProfileSchema';
import { validateRequestSchema } from '../middlewares/validateRequestSchema';
import { changePasswordSchema } from '../validationSchema/changePasswordSchema';

const settingsRoute = express.Router();

settingsRoute.post(
	'/profile',
	[isAuthenticated],
	editProfileSchema,
	validateRequestSchema,
	editProfile
);
settingsRoute.post(
	'/change-password',
	[isAuthenticated],
	changePasswordSchema,
	validateRequestSchema,
	changePassword
);
settingsRoute.delete('/delete-account', [isAuthenticated], deleteAccount);

export { settingsRoute };
