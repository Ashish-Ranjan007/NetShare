import express from 'express';
import { getFeeds } from '../controllers/feeds.controller';

import { isAuthenticated } from '../middlewares/isAuthenticated';

export const homeRoute = express.Router();

homeRoute.get('/feeds', [isAuthenticated], getFeeds);
