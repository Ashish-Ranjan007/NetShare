import { NextFunction, Request, Response } from 'express';

import { User } from '../models/User.model';
import { verifyJWT } from '../utils/verifyJWT';
import { sendToken } from '../utils/sendToken';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { getUserObject } from '../utils/getUserObject';
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

		// Populate friends, followers, followings and recentSearches
		await user.populate({
			path: 'friends followers followings recentSearches',
			select: '_id username profilePic',
		});

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

		// Populate friends, followers, followings and recentSearches
		await user.populate({
			path: 'friends followers followings recentSearches',
			select: '_id username profilePic',
		});

		res.status(200).json(
			new ResponseData(
				true,
				{
					userObj: getUserObject(user),
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
		const { username } = req.query;

		if (!username) {
			return next(new ErrorHandler('No userid is provided', 400));
		}

		const userObj = await User.find(
			{ username: username },
			{
				email: 0,
				friends: 0,
				followings: 0,
				recentSearches: 0,
				notifications: 0,
				notificationHistory: 0,
			}
		).lean();

		if (userObj.length === 0) {
			return next(new ErrorHandler('User does not exist.', 400));
		}

		const isFollowing = userObj[0].followers.find(
			(follower) => follower.id === req.user._id.toString()
		)
			? true
			: false;

		userObj[0].followers = [];

		res.status(200).json(
			new ResponseData(true, {
				user: { ...userObj[0], isFollowing },
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

		const page = parseInt(req.query.page as string) || 0;

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
			.skip(page * 20)
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
					currentUser.recentSearches[i].toString() ===
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
			currentUser.recentSearches.unshift(recentlySearchedUser._id);

			await currentUser.save();
			return res.status(201).json(new ResponseData(true, {}));
		}

		res.status(200).json(new ResponseData(true, {}));
	}
);

// Follow
export const follow = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { targetId } = req.body;

		if (targetId === req.user._id.toString()) {
			return next(new ErrorHandler('Bad request', 400));
		}

		const user = await User.findById(req.user._id);
		const target = await User.findById(targetId);

		// Both user and target user should exist
		if (!user || !target) {
			return next(new ErrorHandler('User does not exist', 404));
		}

		// If User already follows target user return conflict error
		for (let i = 0; i < user.followings.length; i++) {
			if (user.followings[i].toString() === target._id.toString()) {
				return next(new ErrorHandler('User is already followed', 409));
			}
		}

		// Push target user into user's followings array
		user.followings.push(target._id);

		// increase followingsCount of user
		user.followingsCount += 1;

		// If target already follows user make them friends
		for (let i = 0; i < user.followers.length; i++) {
			if (user.followers[i].toString() === target._id.toString()) {
				user.friends.push(target._id);

				// increase friendsCount of user
				user.friendsCount += 1;

				target.friends.push(user._id);

				// increase friendsCount of target
				target.friendsCount += 1;

				break;
			}
		}

		// Update user
		await user.save();

		// Push user into target user's followers array
		target.followers.push(user._id);

		// notify target
		target.notifications.push({
			user: req.user._id,
			action: 'followed',
			contentType: 'profile',
			time: new Date(),
		});
		target.notificationCount++;

		// increase followersCount of user
		target.followersCount += 1;

		// Update target
		await target.save();

		res.status(200).json(new ResponseData(true, {}));
	}
);

// Unfollow
export const unFollow = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { targetId } = req.body;

		if (targetId === req.user._id.toString()) {
			return next(new ErrorHandler('Bad request', 400));
		}

		const user = await User.findById(req.user._id);
		const target = await User.findById(targetId);

		// Both user and target user should exist
		if (!user || !target) {
			return next(new ErrorHandler('User does not exist', 404));
		}

		// If User doesnt already follows target user return conflict error
		const newFollowingsArray = user.followings.filter(
			(following) => following.toString() !== target._id.toString()
		);

		if (newFollowingsArray.length === user.followings.length) {
			return next(new ErrorHandler('User is not followed already', 409));
		}

		// Update user's followings array
		user.followings = newFollowingsArray;

		// decrease followingsCount of user
		user.followingsCount -= 1;

		// Remove target from user's friends array if present
		user.friends = user.friends.filter((friend) => {
			if (friend.toString() === target._id.toString()) {
				// decrease friendsCount of uset
				user.friendsCount -= 1;

				return false;
			}

			return true;
		});

		// Update user
		await user.save();

		// Remove user from target user's followers array
		target.followers = target.followers.filter((follower) => {
			if (follower.toString() === user._id.toString()) {
				// decrease followersCount of target
				target.followersCount -= 1;

				return false;
			}

			return true;
		});

		// Remove user from target's friends array if present
		target.friends = target.friends.filter((friend) => {
			if (friend.toString() === user._id.toString()) {
				// decrease friendsCount of target
				target.friendsCount -= 1;

				return false;
			}

			return true;
		});

		// Update target
		await target.save();

		res.status(200).json(new ResponseData(true, {}));
	}
);

// Get Followers
export const getFollowers = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId } = req.query;

		const user = await User.findById(userId).populate({
			path: 'followers',
			select: '_id profilePic username',
		});

		if (!user) {
			return next(new ErrorHandler('Resource not found', 404));
		}

		const followersPerPage = 20;
		const page = parseInt(req.query.page as string) || 0;
		const totalFollowers = user.followersCount;

		const hasPrev = page === 0 ? false : true;
		const hasNext =
			totalFollowers - (page * followersPerPage + followersPerPage) > 0
				? true
				: false;

		const followers = user.followers.splice(
			page * followersPerPage,
			followersPerPage
		);

		res.status(200).json(
			new ResponseData(true, { hasPrev, hasNext, followers })
		);
	}
);

// Get Followings
export const getFollowings = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId } = req.query;

		const user = await User.findById(userId).populate({
			path: 'followings',
			select: '_id profilePic username',
		});

		if (!user) {
			return next(new ErrorHandler('Resource not found', 404));
		}

		const followingsPerPage = 20;
		const page = parseInt(req.query.page as string) || 0;
		const totalFollowings = user.followingsCount;

		const hasPrev = page === 0 ? false : true;
		const hasNext =
			totalFollowings - (page * followingsPerPage + followingsPerPage) > 0
				? true
				: false;

		const followings = user.followings.splice(
			page * followingsPerPage,
			followingsPerPage
		);

		res.status(200).json(
			new ResponseData(true, { hasPrev, hasNext, followings })
		);
	}
);

// Get Friends
export const getFriends = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { searchTerm } = req.query;

		let friends = await User.findById(req.user._id)
			.select('friends')
			.populate({
				path: 'friends',
				select: '_id profilePic username',
			});

		if (!friends) {
			return next(new ErrorHandler('Resource not found', 404));
		}

		// Return all friends if no searchTerm is provided
		if (!searchTerm || searchTerm.length === 0) {
			return res
				.status(200)
				.json(new ResponseData(true, { results: friends.friends }));
		}

		// Filter friends against provided searchTerm
		const result = friends.friends.filter((friend: any) => {
			const re = new RegExp(searchTerm.toString(), 'i');

			if (friend.username.match(re)) {
				return true;
			} else {
				false;
			}
		});

		res.status(200).json(new ResponseData(true, { results: result }));
	}
);
