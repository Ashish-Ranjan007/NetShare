import { NextFunction, Request, Response } from 'express';

import { User } from '../models/User.model';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

export const editProfile = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const {
			userId,
			profilePic,
			firstname,
			lastname,
			bio,
			dateOfBirth,
			gender,
		} = req.body;

		if (!userId) {
			return next(new ErrorHandler('No userId is provided', 400));
		}

		const user = await User.findById(userId);

		if (!user) {
			return next(new ErrorHandler('Invalid userId', 400));
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
				userObj: {
					id: user._id.toString(),
					bio: user.bio,
					email: user.email,
					gender: user.gender,
					friends: user.friends,
					username: user.username,
					firstname: user.firstname,
					lastname: user.lastname,
					dateOfBirth: user.dateOfBirth,
					profilePic: user.profilePic,
					postsCount: user.postsCount,
					friendsCount: user.friendsCount,
					followersCount: user.followersCount,
					followingsCount: user.followingsCount,
					followers: user.followers.slice(0, 10),
					followings: user.followings.slice(0, 10),
					notifications: user.notificationCount,
					recentSearches: user.recentSearches.slice(0, 10),
				},
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
