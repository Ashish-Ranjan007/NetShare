import { NextFunction, Request, Response } from 'express';

import { User } from '../models/User';
import { verifyJWT } from '../utils/verifyJWT';
import { sendToken } from '../utils/sendToken';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

// Register a new user
export const register = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { firstname, lastname, username, email, password } = req.body;

		const doesEmailExists = await User.exists({ email: email });

		if (doesEmailExists) {
			return next(new ErrorHandler('Email already exists', 409));
		}

		const doesUsernameExists = await User.exists({ username: username });

		if (doesUsernameExists) {
			return next(new ErrorHandler('Username already exists', 409));
		}

		const user = await User.create({
			firstname,
			lastname,
			username,
			email,
			password,
		});

		sendToken(user, 201, res);
	}
);

// Login an existing user
export const login = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body;

		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			return next(new ErrorHandler('Invalid Credentials', 401));
		}

		const isMatched: boolean = await user.matchPasswords(password);

		if (!isMatched) {
			return next(new ErrorHandler('Invalid Credentials', 401));
		}

		sendToken(user, 200, res);
	}
);

// Logout an authenticated user
export const logout = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });

		res.status(200)
			.clearCookie('refreshToken')
			.json(new ResponseData(true, {}, '', ''));
	}
);

// Refresh Token
export const refreshToken = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { refreshToken } = req.cookies;

		if (!refreshToken) {
			return next(new ErrorHandler('Unauthorized', 401));
		}

		const user = await User.findOne({ refreshToken });

		if (!user) {
			return next(
				new ErrorHandler('Please Login to access this resource', 401)
			);
		}

		const { payload, invalid } = verifyJWT(
			refreshToken,
			process.env.JWT_REFRESH_SECRET as string
		);

		if (invalid || !payload?._id) {
			return next(
				new ErrorHandler('Please Login to access this resource', 401)
			);
		}

		const accessToken = user.getSignedToken();

		res.status(200).json(
			new ResponseData(
				true,
				{
					userObj: {
						email: user.email,
						username: user.username,
						profilePic: user.profilePic,
						followers: user.followers.slice(0, 10),
						followings: user.followings.slice(0, 10),
						recentSearches: user.recentSearches.slice(0, 10),
					},
				},
				'',
				accessToken
			)
		);
	}
);

// Get user details
export const getUserDetails = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		res.status(200).json(
			new ResponseData(true, {
				userObj: {
					email: req.user.email,
					username: req.user.username,
				},
			})
		);
	}
);

// Search Users
export const getSearchUsers = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { searchTerm } = req.query;
		const limitToSeven = req.query.limitToSeven ? 7 : 20;

		if (!searchTerm || searchTerm.length === 0) {
			return next(new ErrorHandler('Search term not provided', 400));
		}

		// Get all users that have the provided searchTerm in their username, firstname or lastname except the current user
		const users = await User.find({
			$and: [
				{ _id: { $ne: req.user._id } },
				{
					$or: [
						{ username: { $regex: searchTerm, $options: 'i' } },
						{ firstname: { $regex: searchTerm, $options: 'i' } },
						{ lastname: { $regex: searchTerm, $options: 'i' } },
					],
				},
			],
		})
			.select('_id profilePic username')
			.limit(limitToSeven);

		res.status(200).json(
			new ResponseData(true, {
				results: users,
			})
		);
	}
);

// Add recently searched user
export const postAddRecentSearch = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId } = req.body;

		if (!userId || userId.length === 0) {
			return next(new ErrorHandler('No user id is provided', 400));
		}

		const recentlySearchedUser = await User.findById(userId);
		const currentUser = await User.findById(req.user._id);

		if (recentlySearchedUser && currentUser) {
			// Check if recentlySearchedUser is already in the recentSearches array of currentUser
			for (let i = 0; i < currentUser.recentSearches.length; i++) {
				if (
					currentUser.recentSearches[i].id ===
					recentlySearchedUser._id.toString()
				) {
					return res.status(200).json(new ResponseData(true, {}));
				}
			}

			// Remove an element from the recentSearches array if length is greater than 5
			if (currentUser.recentSearches.length > 5) {
				currentUser.recentSearches.pop();
			}

			// Insert the new recentSearch at the start of the array
			currentUser.recentSearches?.unshift({
				id: recentlySearchedUser._id.toString(),
				profilePic: recentlySearchedUser.profilePic,
				username: recentlySearchedUser.username,
			});

			await currentUser.save();
			res.status(201).json(new ResponseData(true, {}));
		}

		res.status(200).json(new ResponseData(true, {}));
	}
);

// Follow
export const follow = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId, targetId } = req.body;

		const user = await User.findById(userId);
		const target = await User.findById(targetId);

		// Both user and target user should exist
		if (!user || !target) {
			return next(new ErrorHandler('User does not exist', 404));
		}

		// If User already follows target user return conflict error
		for (let i = 0; i < user.followings.length; i++) {
			if (user.followings[i].id === target._id.toString()) {
				return next(new ErrorHandler('User is already followed', 409));
			}
		}

		// Push target user into user's followings array
		user.followings.push({
			id: target._id.toString(),
			username: target.username,
			profilePic: target.profilePic,
		});

		await user.save();

		// Push user into target user's followers array
		target.followers.push({
			id: userId,
			username: user.username,
			profilePic: user.profilePic,
		});

		await target.save();

		res.status(200).json(new ResponseData(true, {}));
	}
);

// Unfollow
export const unFollow = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId, targetId } = req.body;

		const user = await User.findById(userId);
		const target = await User.findById(targetId);

		// Both user and target user should exist
		if (!user || !target) {
			return next(new ErrorHandler('User does not exist', 404));
		}

		// If User doesnt already follows target user return conflict error
		const newFollowingsArray = user.followings.filter(
			(following) => following.id !== target._id.toString()
		);

		if (newFollowingsArray.length === user.followings.length) {
			return next(new ErrorHandler('User is not followed already', 409));
		}

		// Update user
		user.followings = newFollowingsArray;
		await user.save();

		// Remove user from target user's followers array
		target.followers = target.followers.filter(
			(follower) => follower.id !== userId
		);
		await target.save();

		res.status(200).json(new ResponseData(true, {}));
	}
);

// Get Followers
export const getFollowers = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { searchTerm } = req.query;

		if (!searchTerm || searchTerm.length === 0) {
			const followers = await User.findById(req.user._id)
				.select('followers')
				.limit(20);

			return res
				.status(200)
				.json(new ResponseData(true, { results: followers }));
		}

		const followers = await User.find({
			followers: { username: { $regex: searchTerm, $options: 'i' } },
		}).limit(20);

		res.status(200).json(new ResponseData(true, { results: followers }));
	}
);

// Get Followings
export const getFollowings = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { searchTerm } = req.query;

		if (!searchTerm || searchTerm.length === 0) {
			const followings = await User.findById(req.user._id)
				.select('followings')
				.limit(20);

			res.status(200).json(
				new ResponseData(true, { results: followings })
			);
		}

		const followings = await User.find({
			followings: { username: { $regex: searchTerm, $options: 'i' } },
		}).limit(20);

		res.status(200).json(new ResponseData(true, { results: followings }));
	}
);
