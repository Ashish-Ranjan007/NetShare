import { body } from 'express-validator';

export const registrationSchema = [
	body('firstname')
		.isString()
		.not()
		.isEmpty()
		.withMessage('Please enter your firstname')
		.trim()
		.escape(),
	body('lastname')
		.isString()
		.not()
		.isEmpty()
		.withMessage('Please enter your lastname')
		.trim()
		.escape(),
	body('username')
		.isString()
		.not()
		.isEmpty()
		.withMessage('Please enter an username')
		.trim()
		.escape(),
	body('email')
		.isString()
		.isEmail()
		.normalizeEmail()
		.withMessage('Please enter a valid email'),
	body('password')
		.isString()
		.isLength({ min: 8 })
		.not()
		.isLowercase()
		.not()
		.isUppercase()
		.not()
		.isAlphanumeric()
		.withMessage(
			'Password should contain atleast 8 characters containing one uppercase, one lowercase, one numeric and one special character.'
		),
	body('confirmPassword').custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error("Passwords doesn't match");
		}

		return true;
	}),
];
