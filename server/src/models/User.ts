import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose, { Model, Schema, model } from 'mongoose';

// Document Interface
interface User {
	firstname: string;
	lastname: string;
	username: string;
	email: string;
	password: string;
	refreshToken: string;
}

interface UserMethods {
	getSignedToken(): string;
	getRefreshToken(): string;
	matchPasswords(password: string): Promise<string>;
}

type UserModel = Model<User, {}, UserMethods>;

// Schema
const UserSchema = new Schema<User, UserModel, UserMethods>({
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
	password: {
		type: String,
		required: [true, 'Please enter your password '],
		minLength: [8, 'Password should be greater than 8 characters'],
		select: false,
	},
	refreshToken: {
		type: String,
		select: false,
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
export const User = model<User, UserModel>('User', UserSchema);
