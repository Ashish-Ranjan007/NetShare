import { Request, Response, NextFunction } from 'express';

import { User } from '../models/User.model';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

export const getNotifications = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		let notifications = await User.findById(req.user._id)
			.select('notifications')
			.sort({ _id: -1 })
			.then((user) => user?.notifications);

		if (!notifications) {
			return res.status(200).json(
				new ResponseData(true, {
					hasPrev: false,
					hasNext: false,
					notifications: [],
				})
			);
		}

		const notificationsPerPage = 25;
		const page = parseInt(req.query.page as string) || 0;
		const hasPrev = page > 0 ? true : false;
		const hasNext =
			notifications.length -
				(page * notificationsPerPage + notificationsPerPage) >
			0
				? true
				: false;

		notifications.reverse();
		notifications = notifications.slice(
			page * notificationsPerPage,
			page * notificationsPerPage + notificationsPerPage
		);

		res.status(200).json(
			new ResponseData(true, {
				hasPrev: hasPrev,
				hasNext: hasNext,
				notifications: notifications,
			})
		);
	}
);

export const getNotificationHistory = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		let notifications = await User.findById({ _id: req.user._id })
			.select('notificationHistory')
			.sort({ _id: -1 })
			.then((user) => user?.notificationHistory);

		if (!notifications) {
			return res.status(200).json(
				new ResponseData(true, {
					hasPrev: false,
					hasNext: false,
					notifications: [],
				})
			);
		}

		const notificationsPerPage = 25;
		const page = parseInt(req.query.page as string) || 0;
		const hasPrev = page > 0 ? true : false;
		const hasNext =
			notifications.length -
				(page * notificationsPerPage + notificationsPerPage) >
			0
				? true
				: false;

		notifications = notifications.slice(
			page * notificationsPerPage,
			page * notificationsPerPage + notificationsPerPage
		);

		res.status(200).json(
			new ResponseData(true, {
				hasPrev: hasPrev,
				hasNext: hasNext,
				notificationHistory: notifications,
			})
		);
	}
);

export const clearNotifications = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = await User.findById(req.user._id, {
			notifications: 1,
			notificationHistory: 1,
		});

		if (!user) {
			return next(new ErrorHandler('Bad Request', 400));
		}

		user.notificationCount = 0;

		await user.save();

		res.status(200).json(new ResponseData(true));
	}
);
