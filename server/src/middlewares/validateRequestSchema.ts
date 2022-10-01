import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

import { ErrorHandler } from '../utils/ErrorHandler';

export const validateRequestSchema = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		next(new ErrorHandler(errors.array()[0].msg, 400));
	}

	next();
};
