import { Types } from 'mongoose';
import { NextFunction, Request, Response } from 'express';

import { Chat } from '../models/Chat.model';
import { Message } from '../models/Message.model';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

// Fetch messages for a chat
export const fetchMessages = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { chatId } = req.body;

		// Validate request body
		if (!chatId) {
			return next(new ErrorHandler('Provide a chatId', 400));
		}

		// Check if chat exist
		const chat = await Chat.findById(chatId);
		if (!chat) {
			return next(new ErrorHandler('Provided chatId is invalid', 400));
		}

		// Only members are authorized for this operation
		const isMember = chat.members.find(
			(member) => member.id === req.user._id.toString()
		);
		if (!isMember) {
			return next(
				new ErrorHandler(
					'Not authorized to perform this operation',
					400
				)
			);
		}

		// Query messages
		const totalResults = chat.totalMessages;

		const messagesPerPage = 20;
		const page = parseInt(req.query.page as string) || 0;

		const hasPrev = page === 0 ? false : true;
		const hasNext =
			totalResults - (page * messagesPerPage + messagesPerPage) > 0
				? true
				: false;

		const messages = await Message.find({
			chat: new Types.ObjectId(chatId),
		})
			.sort({ createdAt: -1 })
			.skip(page * messagesPerPage)
			.limit(messagesPerPage);

		// Response
		res.status(200).json(
			new ResponseData(true, { hasPrev, hasNext, messages })
		);
	}
);

// Delete a message
export const deleteMessage = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { messageId } = req.body;

		// Validate request body
		if (!messageId) {
			return next(new ErrorHandler('Provide a messageId', 400));
		}

		// Check if message exist
		const message = await Message.findById(messageId);
		if (!message) {
			return next(new ErrorHandler('Provided messageId is invalid', 400));
		}

		// Only creator can delete a message
		if (message.sender.id !== req.user._id.toString()) {
			return next(
				new ErrorHandler(
					'Only creator of a message is authorized to delete it',
					400
				)
			);
		}

		// Delete the message
		await message.delete();

		// Response
		res.status(200).json(new ResponseData(true));
	}
);
