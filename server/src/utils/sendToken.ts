import { CookieOptions, NextFunction, Response } from 'express';

import { User } from '../models/User.model';
import { ResponseData } from './ResponseData';

/* 
	1. Create accessToken and refreshToken.
	2. Save refreshToken in database.
	3. Send accessToken in reponse data.
	4. Send refreshToken as an httpOnly cookie 
*/

export const sendToken = async (
	user: any,
	statusCode: number,
	res: Response
) => {
	const accessToken = user.getSignedToken();
	const refreshToken = user.getRefreshToken();
	const cookieExpire = parseInt(process.env.COOKIE_EXPIRE as string);

	// Set refresh token in database
	await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken });

	const options: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'none',
		expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
	};

	res.status(statusCode)
		.cookie('refreshToken', refreshToken, options)
		.json(
			new ResponseData(
				true,
				{
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
				},
				'',
				accessToken
			)
		);
};
