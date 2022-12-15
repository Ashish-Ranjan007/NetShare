import express from 'express';

import {
	getBirthdays,
	getSuggestProfiles,
} from '../controllers/widgets.controller';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const widgetRoute = express.Router();

widgetRoute.get('/suggested-profiles', [isAuthenticated], getSuggestProfiles);
widgetRoute.get('/birthdays', [isAuthenticated], getBirthdays);

export { widgetRoute };
