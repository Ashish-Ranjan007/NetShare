import { model, Schema } from 'mongoose';

type ProfileReference = {
	id: string;
	profilePic: string;
	username: string;
};

export interface IMessage {
	sender: ProfileReference;
	content: string;
	chatId: Schema.Types.ObjectId;
	repliedTo: Schema.Types.ObjectId;
}

const MessageSchema = new Schema<IMessage>(
	{
		sender: {
			type: { id: String, profilePic: String, username: String },
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		chatId: {
			type: Schema.Types.ObjectId,
			ref: 'Chat',
		},
		repliedTo: {
			type: Schema.Types.ObjectId,
			ref: 'Message',
		},
	},
	{ timestamps: true }
);

export const Message = model<IMessage>('Message', MessageSchema);
