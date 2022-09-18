import { CookieOptions, NextFunction, Request, Response } from 'express';

import { User } from '../models/User';
import { verifyJWT } from '../utils/verifyJWT';
import { sendToken } from '../utils/sendToken';
import { ErrorHandler } from '../utils/ErrorHandler';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';
import { ResponseData } from '../utils/ResponseData';

// Register a new user
export const register = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { firstname, lastname, username, email, password } = req.body;

		const doesEmailExists = await User.findOne({ email });

		if (doesEmailExists) {
			return next(new ErrorHandler('Email already exists', 409));
		}

		const doesUsernameExists = await User.findOne({ username });

		if (doesUsernameExists) {
			return next(new ErrorHandler('Username already exists', 409));
		}

		const user = await User.create({
			firstname,
			lastname,
			username,
			email,
			password,
			refreshToken: '',
		});

		sendToken(user, 201, res, next);
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

		const isMatched: string = await user.matchPasswords(password);

		if (!isMatched) {
			return next(new ErrorHandler('Invalid Credentials', 401));
		}

		sendToken(user, 200, res, next);
	}
);

// Logout an user
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
					},
				},
				'',
				accessToken
			)
		);
	}
);

// Get user details
export const getUserDetails = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	res.status(200).json({
		success: true,
		user: {
			email: req.user.email,
			username: req.user.username,
		},
	});
};
