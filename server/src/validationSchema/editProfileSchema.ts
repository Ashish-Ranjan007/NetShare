import { body } from 'express-validator';

export const editProfileSchema = [
	body('userId')
		.exists()
		.withMessage('userId not provided')
		.isString()
		.withMessage('userId has to be a string')
		.not()
		.isEmpty()
		.withMessage('userId not provided')
		.trim()
		.escape(),
	body('firstname').isString().trim().escape(),
	body('lastname').isString().trim().escape(),
	body('profilePic').isString(),
	body('bio').isString().trim().escape(),
	body('dateOfBirth').isString(),
	body('gender').isString(),
];
