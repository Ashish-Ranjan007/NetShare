import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

export const error: ErrorRequestHandler = (
	err: ErrorHandler,
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	err.statusCode = err.statusCode || 500;
	err.message = err.message || 'Internal Server Error';

	res.status(err.statusCode).json(new ResponseData(false, {}, err.message));
};
