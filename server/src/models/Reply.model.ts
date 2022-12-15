import { model, Schema } from 'mongoose';

import { Post } from './Post.model';
import { Comment } from './Comment.model';

type ProfileReference = {
	id: string;
	profilePic: string;
	username: string;
};

export interface IReply {
	commentId: string;
	repliedTo: {
		replyId: string | null;
		username: string | null;
	};
	createdBy: ProfileReference;
	createdAt: Date;
	likes: number;
	likedBy: string[];
	content: string;
	updatedAt: Date | null;
}

const ReplySchema = new Schema<IReply>({
	commentId: {
		type: String,
		required: true,
	},
	repliedTo: {
		type: { replyId: String, username: String },
		default: { replyId: null, username: null },
	},
	createdBy: {
		type: { id: String, profilePic: String, username: String },
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
		type: [String],
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
			(replyId) => replyId !== this._id.toString()
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
