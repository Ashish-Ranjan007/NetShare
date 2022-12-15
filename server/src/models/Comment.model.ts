import { model, Schema } from 'mongoose';

import { Post } from './Post.model';
import { Reply } from './Reply.model';

type ProfileReference = {
	id: string;
	profilePic: string;
	username: string;
};

export interface IComment {
	postId: string;
	createdBy: ProfileReference;
	createdAt: Date;
	likes: number;
	likedBy: string[];
	content: string;
	repliesCount: number;
	replies: string[];
	updatedAt: Date | null;
	isLiked: boolean;
}

const CommentSchema = new Schema<IComment>({
	postId: {
		type: String,
		required: true,
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
	repliesCount: {
		type: Number,
		default: 0,
	},
	replies: {
		type: [String],
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
			(commentId) => commentId !== this._id.toString()
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
