import { body } from 'express-validator';

export const editProfileSchema = [
	body('firstname').isString().trim().escape(),
	body('lastname').isString().trim().escape(),
	body('profilePic').isString(),
	body('bio').isString().trim().escape(),
	body('dateOfBirth').isString(),
	body('gender').isString(),
];
