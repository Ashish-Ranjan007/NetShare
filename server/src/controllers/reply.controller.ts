import { NextFunction, Request, Response } from 'express';

import { Post } from '../models/Post.model';
import { User } from '../models/User.model';
import { Reply } from '../models/Reply.model';
import { Comment } from '../models/Comment.model';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

// like reply
export const likeReply = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { replyId } = req.body;

		if (!replyId) {
			return next(new ErrorHandler('No replyId is provided', 400));
		}

		const reply = await Reply.findById(replyId);

		if (!reply) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		// if reply is already liked
		const isLiked = reply.likedBy.find(
			(userId) => userId === req.user._id.toString()
		);

		if (isLiked) {
			return next(new ErrorHandler('Reply is already liked', 400));
		}

		// push userId into likedBy field of reply
		reply.likedBy.push(req.user._id.toString());

		// increase likes count of reply
		reply.likes += 1;

		const commentCreator = await User.findById(reply.createdBy.id);

		if (!commentCreator) {
			return next(
				new ErrorHandler('Creator of comment does not exist', 400)
			);
		}

		// notify the creator of reply
		commentCreator.notifications.push({
			user: {
				id: req.user._id.toString(),
				username: req.user.username,
				profilePic: req.user.profilePic,
			},
			action: 'liked',
			contentType: 'reply',
			contentId: reply._id.toString(),
			time: new Date(),
		});
		commentCreator.notificationCount++;

		await reply.save();
		await commentCreator.save();

		res.status(201).json(new ResponseData(true));
	}
);

// unlike Reply
export const unlikeReply = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { replyId } = req.body;

		if (!replyId) {
			return next(new ErrorHandler('No replyId is provided', 400));
		}

		const reply = await Reply.findById(replyId);

		if (!reply) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		// if reply is not already liked
		const isLiked = reply.likedBy.find(
			(userId) => userId === req.user._id.toString()
		);

		if (!isLiked) {
			return next(new ErrorHandler('Reply is not already liked', 400));
		}

		// remove userId from likedBy field of reply
		reply.likedBy = reply.likedBy.filter(
			(userId) => userId !== req.user._id.toString()
		);

		// decrease likes count of reply
		reply.likes -= 1;

		await reply.save();

		res.status(200).json(new ResponseData(true));
	}
);

// reply to a reply
export const replyToReply = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { commentId, replyId, content } = req.body;

		if (!replyId || !commentId || !content) {
			return next(new ErrorHandler('Bad Request', 400));
		}

		const reply = await Reply.findById(replyId);
		const comment = await Comment.findById(commentId);

		if (!reply || !comment) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		// create a reply
		const newReply = await Reply.create({
			createdBy: {
				id: req.user._id.toString(),
				username: req.user.username,
				profilePic: req.user.profilePic,
			},
			repliedTo: {
				replyId: replyId,
				username: reply.createdBy.username,
			},
			commentId: commentId,
			content: content,
		});

		// insert reply into comment's replies field
		comment.replies.push(newReply._id.toString());

		// increase repliesCount of comment
		comment.repliesCount += 1;

		const post = await Post.findById(comment.postId);

		if (!post) {
			return next(new ErrorHandler('Bad Request', 400));
		}

		// increase commentsCount of post
		post.commentsCount += 1;

		const replyCreator = await User.findById(reply.createdBy.id);
		const commentCreator = await User.findById(comment.createdBy.id);

		if (!replyCreator || !commentCreator) {
			return next(
				new ErrorHandler('Creator of comment does not exist', 400)
			);
		}

		// notify the creator of provided replyId
		replyCreator.notifications.push({
			user: {
				id: req.user._id.toString(),
				username: req.user.username,
				profilePic: req.user.profilePic,
			},
			action: 'replied',
			contentType: 'reply',
			contentId: reply._id.toString(),
			replyId: newReply._id.toString(),
			time: new Date(),
		});
		replyCreator.notificationCount++;

		// notify the creator of the provided commentId
		commentCreator.notifications.push({
			user: {
				id: req.user._id.toString(),
				username: req.user.username,
				profilePic: req.user.profilePic,
			},
			action: 'replied',
			contentType: 'comment',
			contentId: comment._id.toString(),
			replyId: reply._id.toString(),
			time: new Date(),
		});
		commentCreator.notificationCount++;

		await post.save();
		await comment.save();
		await replyCreator.save();
		await commentCreator.save();

		res.status(201).json(new ResponseData(true, { reply: newReply }));
	}
);

// update reply
export const updateReply = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { replyId, content } = req.body;

		if (!replyId || !content) {
			return next(new ErrorHandler('Bad Request', 400));
		}

		const reply = await Reply.findById(replyId);

		if (!reply) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		if (reply.createdBy.id !== req.user._id.toString()) {
			return next(new ErrorHandler('Unauthorized', 401));
		}

		// update the comment's content field
		reply.content = content;

		// set reply's updatedAt field
		reply.updatedAt = (() => new Date())();

		await reply.save();

		res.status(200).json(new ResponseData(true, { reply: reply }));
	}
);

// delete Reply
export const deleteReply = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { replyId } = req.body;

		if (!replyId) {
			return next(new ErrorHandler('No replyId is provided', 400));
		}

		const reply = await Reply.findById(replyId);

		if (!reply) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		if (reply.createdBy.id !== req.user._id.toString()) {
			return next(new ErrorHandler('Unauthorized', 401));
		}

		await reply.delete();

		res.status(200).json(new ResponseData(true));
	}
);
