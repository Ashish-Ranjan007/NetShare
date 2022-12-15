import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Model, Schema, model } from 'mongoose';

type ProfileReference = {
	id: string;
	username: string;
	profilePic: string;
};

type NotificationType = {
	time: Date;
	user: ProfileReference;
	contentId?: string;
	commentId?: String;
	replyId?: string;
	action: 'liked' | 'commented' | 'followed' | 'replied';
	contentType: 'comment' | 'reply' | 'post' | 'profile';
};

// Document Interface
export interface IUser {
	firstname: string;
	lastname: string;
	username: string;
	email: string;
	bio: string;
	password: string;
	refreshToken: string;
	profilePic: string;
	postsCount: number;
	friendsCount: number;
	followersCount: number;
	followingsCount: number;
	dateOfBirth: Date | null;
	notificationCount: number;
	friends: ProfileReference[];
	followers: ProfileReference[];
	followings: ProfileReference[];
	recentSearches: ProfileReference[];
	notifications: NotificationType[];
	notificationHistory: NotificationType[];
	gender: 'Male' | 'Female' | 'Others' | null;
}

export interface IUserMethods {
	getSignedToken(): string;
	getRefreshToken(): string;
	matchPasswords(password: string): Promise<boolean>;
}

export type UserModel = Model<IUser, {}, IUserMethods>;

// Schema
export const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
	firstname: {
		type: String,
		required: [true, 'Please provide a firstname'],
	},
	lastname: {
		type: String,
		required: [true, 'Please provide a lastname'],
	},
	username: {
		type: String,
		required: [true, 'Please provide an username'],
	},
	email: {
		type: String,
		required: [true, 'Please provide an email'],
		unique: true,
		match: [
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			'Please provide a valid email',
		],
	},
	bio: {
		type: String,
		default: '',
	},
	password: {
		type: String,
		required: [true, 'Please enter your password '],
		minLength: [8, 'Password should be greater than 8 characters'],
		select: false,
	},
	refreshToken: {
		type: String,
		select: false,
		default: '',
	},
	profilePic: {
		type: String,
		default: '',
	},
	postsCount: {
		type: Number,
		default: 0,
	},
	friendsCount: {
		type: Number,
		default: 0,
	},
	followersCount: {
		type: Number,
		default: 0,
	},
	followingsCount: {
		type: Number,
		default: 0,
	},
	friends: {
		type: [{ id: String, profilePic: String, username: String }],
		default: [],
	},
	recentSearches: {
		type: [{ id: String, profilePic: String, username: String }],
		default: [],
	},
	followers: {
		type: [{ id: String, profilePic: String, username: String }],
		default: [],
	},
	followings: {
		type: [{ id: String, profilePic: String, username: String }],
		default: [],
	},
	notificationCount: {
		type: Number,
		default: 0,
	},
	notifications: {
		type: [
			{
				time: Date,
				user: {
					id: String,
					profilePic: String,
					username: String,
				},
				postId: String,
				commentId: String,
				replyId: String,
				contentId: String,
				action: String,
				contentType: String,
			},
		],
		default: [],
	},
	notificationHistory: {
		type: [
			{
				user: {
					id: String,
					profilePic: String,
					username: String,
				},
				action: String,
				contentType: String,
			},
		],
		default: [],
	},
	dateOfBirth: {
		type: Date,
		default: null,
	},
	gender: {
		type: String,
		default: null,
	},
});

// Before saving check if password is modified
// If it is create a new password hash
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);

	next();
});

// create a new jwt
UserSchema.method('getSignedToken', function () {
	return jwt.sign(
		{ _id: this._id, email: this.email },
		process.env.JWT_ACCESS_SECRET as string,
		{
			expiresIn: process.env.JWT_ACCESS_EXPIRE,
		}
	);
});

// create a refresh token
UserSchema.method('getRefreshToken', function () {
	const refreshToken = jwt.sign(
		{ _id: this._id },
		process.env.JWT_REFRESH_SECRET as string,
		{
			expiresIn: process.env.JWT_REFRESH_EXPIRE,
		}
	);

	this.refreshToken = refreshToken;

	return refreshToken;
});

// Check if provided password matches the one in db
UserSchema.method('matchPasswords', async function (password: string) {
	return await bcrypt.compare(password, this.password);
});

// Model
export const User = model<IUser, UserModel>('User', UserSchema);
