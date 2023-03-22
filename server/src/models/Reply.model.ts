import { model, Schema, Types } from 'mongoose';

import { Post } from './Post.model';
import { Comment } from './Comment.model';

export interface IReply {
	commentId: Types.ObjectId;
	repliedTo: {
		replyId: string | null;
		username: string | null;
	};
	createdBy: Types.ObjectId;
	createdAt: Date;
	likes: number;
	likedBy: Types.ObjectId[];
	content: string;
	updatedAt: Date | null;
}

const ReplySchema = new Schema<IReply>({
	commentId: {
		type: Schema.Types.ObjectId,
		ref: 'Comment',
		required: true,
	},
	repliedTo: {
		type: { replyId: String, username: String },
		default: { replyId: null, username: null },
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
		type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		default: [],
	},
	content: {
		type: String,
		required: [true, 'No content is provided'],
	},
	updatedAt: {
		type: Date,
		default: null,
	},
});

ReplySchema.pre('remove', async function (next) {
	const comment = await Comment.findById(this.commentId);
	const post = await Post.findById(comment?.postId);

	if (comment && post) {
		// remove replyId from replies field of comment
		comment.replies = comment.replies.filter(
			(replyId) => replyId.toString() !== this._id.toString()
		);

		// decrement repliesCount of comment
		comment.repliesCount -= 1;

		// decrement commentsCount of post
		post.commentsCount -= 1;

		// save comment
		await comment.save();

		// save post
		await post.save();
	}

	next();
});

export const Reply = model<IReply>('Reply', ReplySchema);
