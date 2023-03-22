import { NextFunction, Request, Response } from 'express';

import { User } from '../models/User.model';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { getUserObject } from '../utils/getUserObject';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

export const editProfile = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { profilePic, firstname, lastname, bio, dateOfBirth, gender } =
			req.body;

		const user = await User.findById(req.user._id).populate({
			path: 'friends followers followings recentSearches',
			select: '_id username profilePic',
		});
		if (!user) {
			return next(new ErrorHandler('Invalid user', 400));
		}

		// change profile picture
		if (profilePic !== user.profilePic) {
			user.profilePic = profilePic;
		}

		// change firstname
		if (firstname !== user.firstname) {
			user.firstname = firstname;
		}

		// change lastname
		if (lastname !== user.lastname) {
			user.lastname = lastname;
		}

		// change bio
		if (bio !== user.bio) {
			user.bio = bio;
		}

		// change date of birth
		if (dateOfBirth !== user.dateOfBirth) {
			user.dateOfBirth = new Date(dateOfBirth);
		}

		// change gender
		if (gender !== user.gender) {
			user.gender = gender;
		}

		await user.save();

		res.status(200).json(
			new ResponseData(true, {
				userObj: getUserObject(user),
			})
		);
	}
);

export const changePassword = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId, oldPassword, newPassword } = req.body;

		if (!userId || !oldPassword || !newPassword) {
			return next(
				new ErrorHandler('No userId or password is provided', 400)
			);
		}

		const user = await User.findById(userId).select('+password');

		if (!user) {
			return next(new ErrorHandler('Invalid userId', 400));
		}

		// Validate Password
		const isMatched: boolean = await user.matchPasswords(oldPassword);

		// If oldPassword is invalid return error
		if (!isMatched) {
			return next(new ErrorHandler('Invalid Credentials', 400));
		}

		// Change password
		user.password = newPassword;

		// Save user
		await user.save();

		res.status(200).json(new ResponseData(true, {}));
	}
);

export const deleteAccount = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId, password } = req.body;

		if (!userId || !password) {
			return next(
				new ErrorHandler('No userId or password is provided', 400)
			);
		}

		const user = await User.findById(userId).select('+password');

		if (!user) {
			return next(new ErrorHandler('Invalid userId', 400));
		}

		// Validate Password
		const isMatched: boolean = await user.matchPasswords(password);

		// If oldPassword is invalid return error
		if (!isMatched) {
			return next(new ErrorHandler('Invalid Credentials', 401));
		}

		// delete user from database
		await user.delete();

		res.status(200).json(new ResponseData(true, {}));
	}
);
