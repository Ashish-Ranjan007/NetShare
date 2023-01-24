import mongoose, { model, Schema } from 'mongoose';

export interface IMessage {
	sender: mongoose.Types.ObjectId;
	content: string;
	chat: mongoose.Types.ObjectId;
	repliedTo: mongoose.Types.ObjectId;
}

const MessageSchema = new Schema<IMessage>(
	{
		sender: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		chat: {
			type: Schema.Types.ObjectId,
			ref: 'Chat',
			required: true,
		},
		repliedTo: {
			type: Schema.Types.ObjectId,
			ref: 'Message',
		},
	},
	{ timestamps: true }
);

export const Message = model<IMessage>('Message', MessageSchema);
