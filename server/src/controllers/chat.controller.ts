import { NextFunction, Request, Response } from 'express';

import { Chat } from '../models/Chat.model';
import { User } from '../models/User.model';
import { ErrorHandler } from '../utils/ErrorHandler';
import { ResponseData } from '../utils/ResponseData';
import { catchAsyncErrors } from '../middlewares/catchAsyncErrors';

// Fetch all chats user is involved in
export const fetchAllChats = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const chatsPerPage = 20;
		const page = parseInt(req.query.page as string) || 0;

		// Count total results
		const totalResults = await Chat.count({
			members: { $elemMatch: { id: req.user._id.toString() } },
		});

		const hasPrev = page === 0 ? false : true;
		const hasNext =
			totalResults - (page * chatsPerPage + chatsPerPage) > 0
				? true
				: false;

		// Query all chats that has currentUser
		// Sort it in descending order
		const chats = await Chat.find({
			members: { $elemMatch: { id: req.user._id.toString() } },
		})
			.sort({ updatedAt: -1 })
			.skip(page * chatsPerPage)
			.limit(chatsPerPage);

		// Response
		res.status(200).json(
			new ResponseData(true, { hasPrev, hasNext, chats })
		);
	}
);

// Create a peer-to-peer chat
export const createChat = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { targetId } = req.body;

		// Validate request body
		if (!targetId) {
			return next(new ErrorHandler('No userId is provided', 400));
		}

		// Check if targetUser exist
		const targetUser = await User.findById(targetId);
		if (!targetUser) {
			return next(new ErrorHandler('Invalid userId', 400));
		}

		// Build members array
		const members = [
			{
				id: req.user._id.toString(),
				profilePic: req.user.profilePic,
				username: req.user.username,
			},
			{
				id: targetUser._id.toString(),
				profilePic: targetUser.profilePic,
				username: targetUser.username,
			},
		];

		// Check if this chat already exist
		const chatAlreadyExist = await Chat.find({
			$and: [
				{ isGroup: false },
				{ 'members.id': { $all: [members[0].id, members[1].id] } },
			],
		});
		if (chatAlreadyExist.length > 0) {
			return next(new ErrorHandler('This chat already exist', 400));
		}

		// Create a new Chat
		const chat = await Chat.create({
			isGroup: false,
			members: members,
			name: 'direct message',
		});

		// Response
		res.status(201).json(new ResponseData(true, { chat }));
	}
);

// Create a Group Chat
export const createGroupChat = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { name, userIds } = req.body;

		const currentUser = {
			id: req.user._id.toString(),
			profilePic: req.user.profilePic,
			username: req.user.username,
		};

		const members: { id: string; username: string; profilePic: string }[] =
			[];

		// Build members array
		for (let i = 0; i < userIds.length; i++) {
			// Check if all userIds are valid
			const user = await User.findById(userIds[i]);
			if (!user) {
				return next(
					new ErrorHandler('An invalid userId is provided', 400)
				);
			}

			// Push user into members array
			members.push({
				id: user._id.toString(),
				username: user.username,
				profilePic: user.profilePic,
			});
		}
		members.push(currentUser); // Push current user into members array

		// Create Group Chat
		const groupChat = await Chat.create({
			isGroup: true,
			name: name,
			members: members,
			createdBy: currentUser,
			admins: [currentUser],
		});

		// Response
		res.status(201).json(new ResponseData(true, { groupChat }));
	}
);

// Rename group chat
export const renameGroupChat = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { newName, chatId } = req.body;

		// Validate request body
		if (!newName || !chatId) {
			return next(
				new ErrorHandler(
					'Provide chatId and new name for the group chat',
					400
				)
			);
		}

		// Check if chatId is valid
		const groupChat = await Chat.findById(chatId);
		if (!groupChat || !groupChat.isGroup) {
			return next(new ErrorHandler('Invalid chatId is provided', 400));
		}

		// Only admins are authorized for this operation
		const isAdmin = groupChat.admins.find(
			(admin) => admin.id === req.user._id.toString()
		);
		if (!isAdmin) {
			return next(
				new ErrorHandler(
					'Not authorized to perform this operation',
					400
				)
			);
		}

		// Rename group
		groupChat.name = newName;
		await groupChat.save();

		// Response
		res.status(200).json(new ResponseData(true, { groupChat }));
	}
);

// Add a new member to a group
export const addMember = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { chatId, userId } = req.body;

		// Validate request body
		if (!chatId || !userId) {
			return next(
				new ErrorHandler('chatId and userId is not provided', 400)
			);
		}

		// Check if user and chat exists
		const user = await User.findById(userId);
		const groupChat = await Chat.findById(chatId);
		if (!user || !groupChat || !groupChat.isGroup) {
			return next(
				new ErrorHandler('Provided userId or chatId is invalid', 400)
			);
		}

		// Only admins are authorized for this operation
		const isAdmin = groupChat.admins.find(
			(admin) => admin.id === req.user._id.toString()
		);
		if (!isAdmin) {
			return next(
				new ErrorHandler(
					'Not authorized to perform this operation',
					400
				)
			);
		}

		// Check if provided user is already a member
		const isMember = groupChat.members.find(
			(member) => member.id === userId
		);
		if (isMember) {
			return next(
				new ErrorHandler('User is already a group member', 400)
			);
		}

		// Add new user to the group
		groupChat.members.push({
			id: user._id.toString(),
			username: user.username,
			profilePic: user.profilePic,
		});
		await groupChat.save();

		// Response
		res.status(200).json(new ResponseData(true, { groupChat }));
	}
);

// Remove a member from a group
export const removeMember = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { chatId, memberId } = req.body;

		// Validate request body
		if (!chatId || !memberId) {
			return next(new ErrorHandler('Provide a chatId and memberId', 400));
		}

		// Check if chat exists
		const groupChat = await Chat.findById(chatId);
		if (!groupChat || !groupChat.isGroup) {
			return next(new ErrorHandler('Provided chatId is invalid', 400));
		}

		// Only admins are authorized for this operation
		const isAdmin = groupChat.admins.find(
			(admin) => admin.id === req.user._id.toString()
		);
		if (!isAdmin) {
			return next(
				new ErrorHandler(
					'Not authorized to perform this operation',
					400
				)
			);
		}

		// Cannot remove an admin from group unless its self
		const memberIsAdmin = groupChat.admins.find(
			(admin) => admin.id === memberId
		);
		if (memberIsAdmin && memberId !== req.user._id.toString()) {
			return next(new ErrorHandler('Cannot remove an admin', 400));
		}

		// Remove member
		groupChat.members = groupChat.members.filter(
			(member) => member.id !== memberId
		);
		groupChat.admins = groupChat.admins.filter(
			(admin) => admin.id !== memberId
		);

		// Delete chat if members array is emptied after removal
		if (groupChat.members.length === 0) {
			/* 
				When a chat is deleted all the messages belonging to that chat is deleted too
			*/
			await groupChat.delete();
			// Response
			return res.status(200).json(new ResponseData(true));
		}

		// Make a member admin if admins array is emptied after removal
		if (groupChat.admins.length === 0) {
			groupChat.admins.push(groupChat.members[0]);
		}

		// save groupChat
		await groupChat.save();

		// Response
		res.status(200).json(new ResponseData(true, { groupChat }));
	}
);

// Make a group member admin
export const addAdmin = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { chatId, userId } = req.body;

		// Validate request body
		if (!chatId || !userId) {
			return next(new ErrorHandler('Provide chatId and userId', 400));
		}

		// Check if chat and user exist
		const user = await User.findById(userId);
		const chat = await Chat.findById(chatId);
		if (!user || !chat || !chat.isGroup) {
			return next(
				new ErrorHandler('Provided userId or chatId is invalid', 400)
			);
		}

		// Only admins are authorized for this operation
		const isAdmin = chat.admins.find(
			(admin) => admin.id === req.user._id.toString()
		);
		if (!isAdmin) {
			return next(
				new ErrorHandler(
					'Not authorized to perform this operation',
					400
				)
			);
		}

		// Check if provided user is actually a member
		const userIsMember = chat.members.find(
			(member) => member.id === userId
		);
		if (!userIsMember) {
			return next(
				new ErrorHandler(
					'Admins of a group have to be members first',
					400
				)
			);
		}

		// Check if provided user is already an admin
		const userIsAdmin = chat.admins.find((admin) => admin.id === userId);
		if (userIsAdmin) {
			return next(
				new ErrorHandler('Provided userId is already an admin', 400)
			);
		}

		// Add a new admin
		chat.admins.push({
			id: userId,
			username: user.username,
			profilePic: user.profilePic,
		});
		await chat.save();

		// Response
		res.status(200).json(new ResponseData(true, { groupChat: chat }));
	}
);

// Remove a member from admin
export const removeAdmin = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { chatId, adminId } = req.body;

		// Validate request body
		if (!chatId || !adminId) {
			return next(new ErrorHandler('Provide chatId and adminId', 400));
		}

		// Check if chat exist
		const chat = await Chat.findById(chatId);
		if (!chat || !chat.isGroup) {
			return next(new ErrorHandler('Provided chatId is invalid', 400));
		}

		// Only admins are authorized for this operation
		const isAdmin = chat.admins.find(
			(admin) => admin.id === req.user._id.toString()
		);
		if (!isAdmin) {
			return next(
				new ErrorHandler(
					'Not authorized to perform this operation',
					400
				)
			);
		}

		// Remove admin
		chat.admins = chat.admins.filter((admin) => admin.id !== adminId);

		// Make a member admin if admins array is emptied from removal
		if (chat.admins.length === 0) {
			// Check to see if we don't make admin the same users we just removed
			if (chat.members[0].id === adminId) {
				chat.admins.push(chat.members[1]);
			} else {
				chat.admins.push(chat.members[0]);
			}
		}

		// Save chat
		await chat.save();

		// Response
		res.status(200).json(new ResponseData(true, { groupChat: chat }));
	}
);

// Set a display picture for a group
export const setDisplayPicture = catchAsyncErrors(
	async (req: Request, res: Response, next: NextFunction) => {
		const { chatId, displayPictureUrl } = req.body;

		// Validate request body
		if (!chatId || !displayPictureUrl) {
			return next(
				new ErrorHandler('Provide chatId and displayPicture url', 400)
			);
		}

		// Check if chat exist
		const chat = await Chat.findById(chatId);
		if (!chat || !chat.isGroup) {
			return next(new ErrorHandler('Provided chatId is invalid', 400));
		}

		// Only admins are authorized for this operation
		const isAdmin = chat.admins.find(
			(admin) => admin.id === req.user._id.toString()
		);

		if (!isAdmin) {
			return next(
				new ErrorHandler(
					'Not authorized to perform this operation',
					400
				)
			);
		}

		// Set display picture
		chat.displayPicture = displayPictureUrl;
		await chat.save();

		// Response
		res.status(200).json(new ResponseData(true, { groupChat: chat }));
	}
);

// Delete a chat
export const deleteChat = catchAsyncErrors(
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

		if (chat.isGroup) {
			// Only admins are authorized for this operation
			const isAdmin = chat.admins.find(
				(admin) => admin.id === req.user._id.toString()
			);
			if (!isAdmin) {
				return next(
					new ErrorHandler(
						'Not authorized to perform this operation',
						400
					)
				);
			}
		} else {
			// Only members are authorized to delete a chat
			const isMember = chat.members.find(
				(member) => member.id === req.user._id.toString()
			);
			if (!isMember) {
				return next(
					new ErrorHandler(
						'Only members are authorized for this operation',
						400
					)
				);
			}
		}

		/* 
			When a chat is deleted all the messages belonging to that chat is deleted too
		*/
		// Delete chat
		await chat.delete();

		// Response
		res.status(200).json(new ResponseData(true));
	}
);
