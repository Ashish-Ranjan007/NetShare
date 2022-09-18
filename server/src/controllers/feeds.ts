import { NextFunction, Request, Response } from 'express';

export const getFeeds = (req: Request, res: Response, next: NextFunction) => {
	const feeds = {
		message: 'Hello World',
	};

	res.status(200).json({
		success: true,
		feeds,
	});
};
