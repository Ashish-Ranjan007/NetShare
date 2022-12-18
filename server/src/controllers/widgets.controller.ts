import { Request, Response, NextFunction } from 'express';

import { User } from '../models/User.model';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

type SuggestedProfile = {
	id: string;
	username: string;
	profilePic: string;
};

// Profile Suggestions
export const getSuggestProfiles = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		// Suggest 5 random profiles current user does not already follow
		const users = await User.find({
			$and: [
				{ _id: { $ne: req.user._id.toString() } },
				{ 'followers.id': { $ne: req.user._id.toString() } },
			],
		}).limit(5);

		const result: SuggestedProfile[] = users.map((user) => {
			return {
				id: user._id.toString(),
				username: user.username,
				profilePic: user.profilePic,
			};
		});

		res.status(200).json(
			new ResponseData(true, { suggestedProfiles: result })
		);
	}
);

// Birthday Notification
export const getBirthdays = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		// Get Birthdays of friends
		const user = await User.findById(req.user._id);

		if (!user) {
			return next(new ErrorHandler('User not found', 404));
		}

		const friends = [];

		for (let i = 0; i < user.friends.length; i++) {
			const friend = await User.findById(user.friends[i].id);

			if (!friend || !friend.dateOfBirth) continue;

			const date = new Date();
			const dateOfBirth = new Date(friend.dateOfBirth);

			if (
				date.getDate() === dateOfBirth.getDate() &&
				date.getMonth() === dateOfBirth.getMonth()
			) {
				friends.push({
					id: friend._id.toString(),
					username: friend.username,
					profilePic: friend.profilePic,
				});
			}
		}

		res.status(200).json(new ResponseData(true, { friends: friends }));
	}
);
