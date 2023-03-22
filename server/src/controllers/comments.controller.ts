import { Request, Response, NextFunction } from 'express';

import { User } from '../models/User.model';
import { Post } from '../models/Post.model';
import { Reply } from '../models/Reply.model';
import { Comment } from '../models/Comment.model';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

export const likeComment = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId } = req.body;

		if (!commentId) {
			return next(new ErrorHandler('No comment is provided', 400));
		}

		const comment = await Comment.findById(commentId);
		if (!comment) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		// if comment is already liked
		const isLiked = comment.likedBy.find(
			(userId) => userId.toString() === req.user._id.toString()
		);
		if (isLiked) {
			return next(new ErrorHandler('Comment is already liked', 400));
		}

		// push userId into likedBy field of comment
		comment.likedBy.push(req.user._id);

		// increase liked count of the provided commentId
		comment.likes += 1;

		const commentCreator = await User.findById(comment.createdBy);
		if (!commentCreator) {
			return next(
				new ErrorHandler('Creator of comment does not exist', 400)
			);
		}

		// notify the creator of the provided commentId
		commentCreator.notifications.push({
			user: req.user._id,
			action: 'liked',
			contentType: 'comment',
			contentId: comment._id,
			time: new Date(),
		});
		commentCreator.notificationCount++;

		await comment.save();
		await commentCreator.save();

		res.status(201).json(new ResponseData(true));
	}
);

export const unlikeComment = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId } = req.body;

		if (!commentId) {
			return next(new ErrorHandler('No comment is provided', 400));
		}

		const comment = await Comment.findById(commentId);
		if (!comment) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		// Check if userId already exists in the likedBy field of comment
		const isLiked = comment.likedBy.find(
			(userId) => userId.toString() === req.user._id.toString()
		);
		if (!isLiked) {
			return next(new ErrorHandler('Comment is not liked already.', 400));
		}

		// remove userId from comment's likedBy field
		comment.likedBy = comment.likedBy.filter(
			(userId) => userId.toString() !== req.user._id.toString()
		);

		// decrease likes count of the provided commentId
		comment.likes -= 1;

		await comment.save();

		res.status(200).json(new ResponseData(true));
	}
);

export const replyOnComment = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId, content } = req.body;

		if (!commentId || !content) {
			return next(new ErrorHandler('Bad Request', 400));
		}

		const comment = await Comment.findById(commentId);
		if (!comment) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		// create a reply
		const reply = await Reply.create({
			createdBy: req.user._id,
			commentId: commentId,
			content: content,
		});

		// insert reply into comment's replies field
		comment.replies.push(reply._id);

		const post = await Post.findById(comment.postId);
		if (!post) {
			return next(new ErrorHandler('Bad Request', 400));
		}

		// increase commentsCount of post
		post.commentsCount += 1;

		// increase repliesCount of comment
		comment.repliesCount += 1;

		const commentCreator = await User.findById(comment.createdBy);
		if (!commentCreator) {
			return next(
				new ErrorHandler('Creator of comment does not exist', 400)
			);
		}

		// notify the creator of the provided commentId
		commentCreator.notifications.push({
			user: req.user._id,
			action: 'replied',
			contentType: 'comment',
			contentId: comment._id,
			replyId: reply._id,
			time: new Date(),
		});
		commentCreator.notificationCount++;

		// Populate createdBy field of Reply
		await reply.populate({
			path: 'createdBy',
			select: '_id username profilePic',
		});

		await post.save();
		await comment.save();
		await commentCreator.save();

		res.status(201).json(new ResponseData(true, { reply: reply }));
	}
);

export const updateComment = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId, content } = req.body;

		if (!commentId || !content) {
			return next(new ErrorHandler('Bad Request', 400));
		}

		const comment = await Comment.findById(commentId)
			.select('-replies')
			.populate({
				path: 'createdBy',
				select: '_id username profilePic',
			});
		if (!comment) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		if (comment.createdBy._id.toString() !== req.user._id.toString()) {
			return next(new ErrorHandler('Unauthorized', 401));
		}

		// update the comment's content field
		comment.content = content;

		// set comment's updatedAt field
		comment.updatedAt = (() => new Date())();

		const isLiked = comment.likedBy.find(
			(userId) => userId.toString() === req.user._id.toString()
		)
			? true
			: false;

		await comment.save();

		res.status(200).json(
			new ResponseData(true, {
				comment: { ...comment.toObject(), isLiked },
			})
		);
	}
);

export const deleteComment = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId } = req.body;

		if (!commentId) {
			return next(new ErrorHandler('No comment is provided', 400));
		}

		const comment = await Comment.findById(commentId);
		if (!comment) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		if (comment.createdBy.toString() !== req.user._id.toString()) {
			return next(new ErrorHandler('Unauthorized', 401));
		}

		/*
			Deleting a comment should delete all its replies
			before deleting current comment runs in the mongodb database
		*/

		await comment.delete();

		res.status(200).json(new ResponseData(true));
	}
);

export const getComment = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId } = req.query;

		if (!commentId) {
			return next(new ErrorHandler('No comment is provided', 400));
		}

		const comment = await Comment.findById({ _id: commentId }).populate({
			path: 'createdBy',
			select: '_id username profilePic',
		});
		if (!comment) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		const isLiked = comment.likedBy.find(
			(userId) => userId.toString() === req.user._id.toString()
		)
			? true
			: false;

		comment.likedBy = [];
		comment.replies = [];

		res.status(200).json(
			new ResponseData(true, {
				comment: { ...comment.toObject(), isLiked },
			})
		);
	}
);

export const getReplies = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId } = req.query;

		if (!commentId) {
			return next(new ErrorHandler('No comment is provided', 400));
		}

		const comment = await Comment.findById({ _id: commentId });
		if (!comment) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		const repliesPerPage = 10;
		const page = parseInt(req.query.page as string) || 0;
		const hasPrev = page === 0 ? false : true;
		const hasNext =
			comment.repliesCount - (page + 1) * repliesPerPage > 0
				? true
				: false;

		const replyIds = comment.replies.slice(
			page * repliesPerPage,
			page * repliesPerPage + repliesPerPage
		);

		const replies = await Reply.find({ _id: { $in: replyIds } })
			.populate({ path: 'createdBy', select: '_id username profilePic' })
			.sort({ _id: 1 })
			.lean();

		replies.forEach((reply) => {
			if (
				reply.likedBy.find(
					(userId) => userId.toString() === req.user._id.toString()
				)
			) {
				(reply as any).isLiked = true;
			} else {
				(reply as any).isLiked = false;
			}

			reply.likedBy = [];
		});

		res.status(200).json(
			new ResponseData(true, {
				hasPrev: hasPrev,
				hasNext: hasNext,
				replies: replies,
			})
		);
	}
);
