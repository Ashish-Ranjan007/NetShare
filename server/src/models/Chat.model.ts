import { model, Schema, Types } from 'mongoose';
import { Message } from './Message.model';

export interface IChat {
	isGroup: boolean;
	members: Types.ObjectId[];
	name: 'direct message' | string;
	createdBy: Types.ObjectId;
	lastMessage: Types.ObjectId;
	displayPicture: string;
	admins: Types.ObjectId[];
	totalMessages: number;
	unreadMessages: {
		userId: Types.ObjectId;
		newMessages: number;
	}[];
}

const ChatSchema = new Schema<IChat>(
	{
		isGroup: {
			type: Boolean,
			required: true,
		},
		members: {
			type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
			required: true,
		},
		name: {
			type: 'String',
			required: true,
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		lastMessage: {
			type: Schema.Types.ObjectId,
			ref: 'Message',
		},
		displayPicture: {
			type: String,
			default: '',
		},
		admins: {
			type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		},
		totalMessages: {
			type: Number,
			default: 0,
		},
		unreadMessages: {
			type: [
				{
					userId: { type: Schema.Types.ObjectId, ref: 'User' },
					newMessages: Number,
				},
			],
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
	await Message.find({ chat: this._id }).then((docs) => {
		docs.forEach(async (doc) => {
			await doc.delete();
		});
	});

	next();
});

export const Chat = model<IChat>('Chat', ChatSchema);
