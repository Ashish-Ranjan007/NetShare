import { body } from 'express-validator';

function isStringArray(arr: any[]): boolean {
	for (let str in arr) {
		if (typeof str !== 'string') {
			console.log(str, typeof str);
			return false;
		}
	}

	return true;
}

export const createGroupSchema = [
	body('name')
		.exists()
		.isString()
		.not()
		.isEmpty()
		.withMessage('Provide a name for the group'),
	body('userIds')
		.exists()
		.withMessage('userIds array not provided')
		.isArray()
		.withMessage(
			'Provide an array of strings containing userIds of minimum 2 and maximum 19 elements'
		)
		.custom((value, { req }) => {
			if (value.length < 2 || value.length > 19) {
				throw new Error(
					'Provide an array of strings containing userIds of minimum 2 and maximum 19 elements'
				);
			}

			if (!isStringArray(value)) {
				throw new Error('Provide an array of strings only');
			}

			return true;
		}),
	body('displayPictureUrl')
		.exists()
		.isString()
		.withMessage('Provide an url string'),
];
