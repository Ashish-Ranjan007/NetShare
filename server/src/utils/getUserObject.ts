import { Types } from 'mongoose';
import { IUser } from '../models/User.model';

interface IExtendedUser extends IUser {
	_id: Types.ObjectId;
}

export const getUserObject = (user: IExtendedUser) => {
	return {
		_id: user._id.toString(),
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
	};
};
