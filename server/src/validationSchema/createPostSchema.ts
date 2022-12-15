import { body } from 'express-validator';

export const createPostSchema = [
	body('contents')
		.isArray()
		.not()
		.isEmpty()
		.withMessage('Please provide valid contents'),
	body('caption').isString(),
];
