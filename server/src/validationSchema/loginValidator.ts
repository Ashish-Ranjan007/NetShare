import { body } from 'express-validator';

export const loginSchema = [
	body('email')
		.isString()
		.isEmail()
		.withMessage('Please enter a valid email')
		.normalizeEmail(),
	body('password')
		.isString()
		.isLength({ min: 8 })
		.withMessage('Password cannot be less than 8 characters'),
];
