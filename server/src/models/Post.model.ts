import { model, Schema } from 'mongoose';
import { Comment } from './Comment.model';

type ProfileReference = {
	id: string;
	profilePic: string;
	username: string;
};

// Document Interface
interface IPost {
	createdBy: ProfileReference;
	createdAt: Date;
	likes: number;
	likedBy: string[];
	comments: string[];
	commentsCount: number;
	contents: {
		public_id: string;
		secure_url: string;
	}[];
	caption: string | null;
}

// Schema
const PostSchema = new Schema<IPost>({
	createdAt: {
		type: Date,
		default: () => new Date(),
	},
	createdBy: {
		type: { id: String, profilePic: String, username: String },
		required: [true, 'Please provide the user id of the creator'],
	},
	likes: {
		type: Number,
		default: 0,
	},
	likedBy: {
		type: [String],
		default: [],
	},
	comments: {
		type: [String],
		default: [],
	},
	commentsCount: {
		type: Number,
		default: 0,
	},
	contents: {
		type: [{ public_id: String, secure_url: String }],
		required: [true, 'No content is provided'],
	},
	caption: {
		type: String,
		default: null,
	},
});

/*
	This only executes for instance methods and not class methods
	For ex :- await Comment.deleteMany({ 'commentedOn.id': this._id.toString() })
	will not execute CommentSchema.pre() method furthermore. So the replies of these 
	comments will not be deleted.
*/
PostSchema.pre('remove', async function (next) {
	await Comment.find({ 'commentedOn.id': this._id.toString() }).then(
		(docs) => {
			docs.forEach(async (doc) => {
				await doc.delete();
			});
		}
	);

	next();
});

// Model
export const Post = model<IPost>('Post', PostSchema);
