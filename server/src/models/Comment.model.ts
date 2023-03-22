import { model, Schema, Types } from 'mongoose';

import { Post } from './Post.model';
import { Reply } from './Reply.model';

export interface IComment {
	postId: string;
	createdBy: Types.ObjectId;
	createdAt: Date;
	likes: number;
	likedBy: Types.ObjectId[];
	content: string;
	repliesCount: number;
	replies: Types.ObjectId[];
	updatedAt: Date | null;
	isLiked: boolean;
}

const CommentSchema = new Schema<IComment>({
	postId: {
		type: String,
		required: true,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'Please provide the user id of the creator'],
	},
	createdAt: {
		type: Date,
		default: () => new Date(),
	},
	likes: {
		type: Number,
		default: 0,
	},
	likedBy: {
		type: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		default: [],
	},
	content: {
		type: String,
		required: [true, 'No content is provided'],
	},
	repliesCount: {
		type: Number,
		default: 0,
	},
	replies: {
		type: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Reply',
			},
		],
		default: [],
	},
	updatedAt: {
		type: Date,
		default: null,
	},
});

CommentSchema.pre('remove', async function (next) {
	const post = await Post.findById(this.postId);

	if (post) {
		// decrease the commentsCount of the post
		post.commentsCount -= 1 + this.repliesCount;

		// remove this from comments field of comment
		post.comments = post.comments.filter(
			(commentId) => commentId.toString() !== this._id.toString()
		);

		await post.save();
	}

	await Reply.find({ commentId: this._id.toString() }).then((docs) => {
		docs.forEach(async (doc) => {
			await doc.delete();
		});
	});

	next();
});

export const Comment = model<IComment>('Comment', CommentSchema);
