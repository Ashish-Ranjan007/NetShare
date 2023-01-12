import { model, Schema } from 'mongoose';
import { Message } from './Message.model';

type ProfileReference = {
	id: string;
	profilePic: string;
	username: string;
};

export interface IChat {
	isGroup: boolean;
	members: ProfileReference[];
	name: 'direct message' | string;
	createdBy: ProfileReference;
	lastMessageId: Schema.Types.ObjectId;
	displayPicture: string;
	admins: ProfileReference[];
	totalMessages: number;
	unreadMessages: {
		userId: Schema.Types.ObjectId;
		newMessages: number;
	};
}

const ChatSchema = new Schema<IChat>(
	{
		isGroup: {
			type: Boolean,
			required: true,
		},
		members: {
			type: [{ id: String, profilePic: String, username: String }],
			required: true,
		},
		name: {
			type: 'String',
			required: true,
		},
		createdBy: {
			type: { id: String, profilePic: String, username: String },
		},
		lastMessageId: {
			type: Schema.Types.ObjectId,
			ref: 'Message',
		},
		displayPicture: {
			type: String,
			default: '',
		},
		admins: {
			type: [{ id: String, profilePic: String, username: String }],
		},
		totalMessages: {
			type: Number,
			default: 0,
		},
		unreadMessages: {
			type: {
				userId: Schema.Types.ObjectId,
				newMessages: Number,
			},
		},
	},
	{ timestamps: true }
);

/*
	This only executes for instance methods and not class methods.

	When a chat is deleted, this method is fired and all the messages
	belonging to this chat are deleted and then this chat is deleted.
*/

ChatSchema.pre('remove', async function (next) {
	await Message.find({ chatId: this._id }).then((docs) => {
		docs.forEach(async (doc) => {
			await doc.delete();
		});
	});

	next();
});

export const Chat = model<IChat>('Chat', ChatSchema);
