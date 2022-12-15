import { body } from 'express-validator';

export const changePasswordSchema = [
	body('userId')
		.exists()
		.withMessage('userId not provided')
		.isString()
		.withMessage('userId can only be a string')
		.not()
		.isEmpty()
		.withMessage('userId not provided'),
	body('oldPassword')
		.exists()
		.withMessage('Old password not provided')
		.isString()
		.withMessage('Password can only be a string')
		.not()
		.isEmpty()
		.withMessage('Old password not provided'),
	body('newPassword')
		.exists()
		.withMessage('New password not provided')
		.isString()
		.withMessage('Password can only be a string')
		.not()
		.isEmpty()
		.withMessage('New password not provided'),
];
