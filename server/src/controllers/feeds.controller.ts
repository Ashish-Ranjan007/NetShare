import { NextFunction, Request, Response } from 'express';

import { Post } from '../models/Post.model';
import { User } from '../models/User.model';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

export const getFeeds = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const user = await User.findById(req.user._id).select(
			'friends followings'
		);

		if (!user) {
			return next(new ErrorHandler('Bad request', 404));
		}

		const postsPerPage = 20;
		const page = parseInt(req.query.page as string) || 0;

		const requiredUserIds = [...user.followings, ...user.friends].map(
			(elem) => elem.id
		);

		const totalResults = await Post.count({
			'createdBy.id': { $in: requiredUserIds },
		});

		const hasPrev = page === 0 ? false : true;
		const hasNext =
			totalResults - (page * postsPerPage + postsPerPage) > 0
				? true
				: false;

		const posts = await Post.find(
			{
				'createdBy.id': { $in: requiredUserIds },
			},
			{ comments: 0 }
		)
			.sort({ _id: -1 })
			.skip(page * postsPerPage)
			.limit(postsPerPage)
			.lean();

		posts.forEach((post) => {
			if (
				post.likedBy.find(
					(userId) => userId === req.user._id.toString()
				)
			) {
				(post as any).isLiked = true;
			} else {
				(post as any).isLiked = false;
			}

			post.likedBy = [];
		});

		res.status(200).json(
			new ResponseData(true, {
				hasPrev: hasPrev,
				hasNext: hasNext,
				posts: posts,
			})
		);
	}
);
