import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ErrorHandler } from '../utils/ErrorHandler';

export const validateRequestSchema = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errors = validationResult(req);
	console.log(errors);

	if (!errors.isEmpty()) {
		next(new ErrorHandler(errors.array()[0].msg, 400));
	}

	next();
};
