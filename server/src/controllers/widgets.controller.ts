import { Request, Response, NextFunction } from 'express';

import { User } from '../models/User.model';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

type SuggestedProfile = {
	_id: string;
	username: string;
	profilePic: string;
};

// Profile Suggestions
export const getSuggestProfiles = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		// Suggest 5 random profiles current user does not already follow
		const users = await User.find({
			$and: [
				{ _id: { $ne: req.user._id } },
				{ followers: { $nin: [req.user._id] } },
			],
		}).limit(5);

		const result: SuggestedProfile[] = users.map((user) => {
			return {
				_id: user._id.toString(),
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
		let friends = await User.findById(req.user._id)
			.select('friends')
			.populate({
				path: 'friends',
				select: '_id username profilePic dateOfBirth',
			})
			.then((user) => {
				if (!user) {
					return [];
				}

				return user.friends;
			});

		friends = friends.filter((friend: any) => {
			if (!friend.dateOfBirth) {
				return false;
			}

			const date = new Date();
			const dateOfBirth = new Date(friend.dateOfBirth);

			if (
				date.getDate() === dateOfBirth.getDate() &&
				date.getMonth() === dateOfBirth.getMonth()
			) {
				return true;
			}

			return false;
		});

		res.status(200).json(new ResponseData(true, { friends: friends }));
	}
);
