import { NextFunction, Request, Response } from 'express';

import { User } from '../models/User.model';
import { verifyJWT } from '../utils/verifyJWT';
import { ErrorHandler } from '../utils/ErrorHandler';
import { catchAsyncErrors } from './catchAsyncErrors';

/* 
	A middleware that checks if the user is authenticated.

	1. Get accessToken from authorization header
	2. If the accessToken is valid, query user from database and set it in request object
*/

export const isAuthenticated = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const accessToken = req.headers.authorization?.split(' ')[1];

		if (!accessToken) {
			return next(
				new ErrorHandler('Please Login to access this resource', 401)
			);
		}

		const { payload, invalid } = verifyJWT(
			accessToken,
			process.env.JWT_ACCESS_SECRET as string
		);

		// If access token is invalid or id doesn't exists on its payload
		if (invalid || !payload?._id) {
			return next(
				new ErrorHandler('Please Login to access this resource', 401)
			);
		}

		const user = await User.findById(
			payload._id,
			'_id email username profilePic'
		);

		if (!user) {
			return next(
				new ErrorHandler('Please Login to access this resource', 401)
			);
		}

		req.user = user;

		next();
	}
);
