import { NextFunction, Request, Response } from 'express';

import { Post } from '../models/Post.model';
import { User } from '../models/User.model';
import { Comment } from '../models/Comment.model';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

export const createPost = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { contents, caption } = req.body;

		if (contents.length === 0) {
			return next(new ErrorHandler('Bad Request', 400));
		}

		// Create post
		const post = await Post.create({
			createdBy: req.user._id,
			contents: contents,
			caption: caption ? caption : null,
		});

		// increment postsCount of user
		const user = await User.findById(req.user._id).select('postsCount');
		if (user) {
			user.postsCount += 1;
			await user.save();
		}

		res.status(201).json(
			new ResponseData(true, {
				postId: post._id,
			})
		);
	}
);

export const deletePost = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.body;

		if (!postId) {
			return next(new ErrorHandler('No post is provided', 400));
		}

		const post = await Post.findById(postId);

		if (!post) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		if (post.createdBy.toString() !== req.user._id.toString()) {
			return next(new ErrorHandler('Unauthorized', 401));
		}

		// Delete post from database
		await post.delete();

		/*
			When a post is deleted it should delete all the
			comments it has and each comment shall delete
			all the replies it has
		*/

		// decrement postsCount of user
		const user = await User.findById(req.user._id).select('postsCount');
		if (user) {
			user.postsCount -= 1;
			await user.save();
		}

		res.status(200).json(new ResponseData(true));
	}
);

export const getRandomPost = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const totalPosts = await Post.count();

		const postsPerPage = 20;
		const page = parseInt(req.query.page as string) || 0;

		const hasPrev = page > 0 ? true : false;
		const hasNext =
			totalPosts - (page + 1) * postsPerPage > 0 ? true : false;

		const posts = await Post.find({})
			.populate({
				path: 'createdBy',
				select: '_id username profilePic',
			})
			.sort({ _id: -1 })
			.skip(page * postsPerPage)
			.limit(postsPerPage);

		res.status(200).json(
			new ResponseData(true, { hasPrev, hasNext, posts })
		);
	}
);

export const getPostById = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.query;

		if (!postId) {
			return next(new ErrorHandler('No post is provided', 400));
		}

		// select everything from post except comments and likedBy
		const post = await Post.find({ _id: postId }, { comments: 0 })
			.populate({
				path: 'createdBy',
				select: '_id username profilePic',
			})
			.lean();

		if (post.length === 0) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		if (
			post[0].likedBy.find(
				(userId) => userId.toString() === req.user._id.toString()
			)
		) {
			(post[0] as any).isLiked = true;
		} else {
			(post[0] as any).isLiked = false;
		}

		post[0].likedBy = [];

		res.status(200).json(
			new ResponseData(true, {
				post: post[0],
			})
		);
	}
);

export const getPostsByUser = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { userId } = req.query;

		if (!userId) {
			return next(new ErrorHandler('No user is provided', 400));
		}

		const user = await User.exists({ _id: userId });

		if (!user) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		const postsPerPage = 20;
		const page = parseInt(req.query.page as string) || 0;

		const hasPrev = page > 0 ? true : false;
		let hasNext =
			(await Post.count({ createdBy: userId })) -
				(page + 1) * postsPerPage >
			0
				? true
				: false;

		const posts = await Post.find({ createdBy: userId }, { comments: 0 })
			.populate({
				path: 'createdBy',
				select: '_id username profilePic',
			})
			.sort({ _id: -1 })
			.skip(page * postsPerPage)
			.limit(postsPerPage)
			.lean();

		posts.forEach((post) => {
			if (
				post.likedBy.find(
					(userId) => userId.toString() === req.user._id.toString()
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

export const likePost = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.body;

		if (!postId) {
			return next(new ErrorHandler('No post is provided', 400));
		}

		const post = await Post.findById(postId);

		if (!post) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		// if already liked do nothing
		const isLiked = post.likedBy.find(
			(userId) => userId.toString() === req.user._id.toString()
		);

		if (isLiked) {
			return next(new ErrorHandler('Post is already liked', 400));
		}

		// push userId into likedBy field of post
		post.likedBy.push(req.user._id);

		// increase likes count of the provided postId
		post.likes += 1;

		const postCreator = await User.findById(post.createdBy);

		if (!postCreator) {
			return next(
				new ErrorHandler('Creator of post does not exist', 400)
			);
		}

		// notify the creator of the provided postId
		postCreator.notifications.push({
			user: req.user._id,
			action: 'liked',
			contentType: 'post',
			contentId: post._id,
			time: new Date(),
		});
		postCreator.notificationCount++;

		await post.save();
		await postCreator.save();

		res.status(201).json(new ResponseData(true));
	}
);

export const unlikePost = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.body;

		if (!postId) {
			return next(new ErrorHandler('No post is provided', 400));
		}

		const post = await Post.findById(postId);

		if (!post) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		// Check if userId already exists in the likedBy field of post
		const isLiked = post.likedBy.find(
			(userId) => userId.toString() === req.user._id.toString()
		);

		if (!isLiked) {
			return next(new ErrorHandler('Post is not liked already.', 400));
		}

		// remove userId from post's likedBy field
		post.likedBy = post.likedBy.filter(
			(userId) => userId.toString() !== req.user._id.toString()
		);

		// decrease likes count of the provided postId
		post.likes -= 1;

		await post.save();

		res.status(200).json(new ResponseData(true));
	}
);

export const commentOnPost = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId, content } = req.body;

		if (!postId || !content) {
			return next(new ErrorHandler('Bad Request', 400));
		}

		const post = await Post.findById(postId);

		if (!post) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		// Create a comment
		const comment = await Comment.create({
			postId: postId,
			createdBy: req.user._id,
			content: content,
		});

		// insert comment's id into comments field of post
		post.comments.push(comment._id);

		// increase commentsCount
		post.commentsCount += 1;

		const postCreator = await User.findById(post.createdBy);

		if (!postCreator) {
			return next(
				new ErrorHandler('Creator of post does not exist', 400)
			);
		}

		// notify the user about the comment
		postCreator.notifications.push({
			user: req.user._id,
			action: 'commented',
			contentType: 'post',
			contentId: post._id,
			commentId: comment._id,
			time: new Date(),
		});
		postCreator.notificationCount++;

		await post.save();
		await postCreator.save();

		// Populate comment's user fields
		await comment.populate({
			path: 'createdBy',
			select: '_id username profilePic',
		});

		res.status(201).json(new ResponseData(true, { comment }));
	}
);

export const getComments = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { postId } = req.query;

		if (!postId) {
			return next(new ErrorHandler('No post is provided', 400));
		}

		const post = await Post.exists({ _id: postId });

		if (!post) {
			return next(new ErrorHandler('Resource does not exist', 404));
		}

		let commentIds = await Post.findById(postId)
			.select('comments')
			.sort({ _id: -1 }) // sorts by generation_time of comment's ObjectId in descending order
			.then((post) => {
				if (!post) {
					return [];
				}

				return post.comments;
			});

		if (!commentIds) {
			return res.status(200).json(
				new ResponseData(true, {
					hasPrev: false,
					hasNext: false,
					comments: [],
				})
			);
		}

		const commentsPerPage = 20;
		const page = parseInt(req.query.page as string) || 0;
		const hasPrev = page > 0 ? true : false;
		const hasNext =
			commentIds.length - (page * commentsPerPage + commentsPerPage) > 0
				? true
				: false;

		commentIds = commentIds.slice(
			page * commentsPerPage,
			page * commentsPerPage + commentsPerPage
		);

		const comments = await Comment.find(
			{ _id: { $in: commentIds } },
			{ replies: 0 }
		)
			.populate({
				path: 'createdBy',
				select: '_id username profilePic',
			})
			.sort({ _id: -1 })
			.lean();

		comments.forEach((comment) => {
			if (
				comment.likedBy.find(
					(userId) => userId.toString() === req.user._id.toString()
				)
			) {
				(comment as any).isLiked = true;
			} else {
				(comment as any).isLiked = false;
			}

			comment.likedBy = [];
		});

		res.status(200).json(
			new ResponseData(true, {
				hasPrev: hasPrev,
				hasNext: hasNext,
				comments: comments,
			})
		);
	}
);
