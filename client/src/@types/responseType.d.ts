export type ProfileReference = {
	_id: string;
	profilePic: string;
	username: string;
};

export type NotificationType = {
	_id: string;
	time: Date;
	user: ProfileReference;
	contentId?: string;
	commentId?: String;
	replyId?: string;
	action: 'liked' | 'commented' | 'followed' | 'replied';
	contentType: 'comment' | 'reply' | 'post' | 'profile';
};

export type MessageType = {
	_id: string;
	createdAt: Date;
	updatedAt: Date;
	sender: {
		_id: string;
		profilePic: string;
		username: string;
	};
	content: string;
	chat: ChatType;
	repliedTo: MessageType;
};

export type ChatType = {
	_id: string;
	isGroup: boolean;
	createdAt: Date;
	updatedAt: Date;
	members: ProfileReference[];
	name: 'direct message' | string;
	createdBy: ProfileReference;
	lastMessage: MessageType | null;
	displayPicture: string;
	admins: ProfileReference[];
	totalMessages: number;
	unreadMessages: {
		userId: mongoose.Types.ObjectId;
		newMessages: number;
	}[];
};

type DataType = {
	userObj: {
		_id: string;
		bio: string;
		email: string;
		firstname: string;
		lastname: string;
		username: string;
		profilePic: string;
		postsCount: number;
		friendsCount: number;
		notifications: number;
		followersCount: number;
		followingsCount: number;
		dateOfBirth: Date | null;
		friends: ProfileReference[];
		followers: ProfileReference[];
		followings: ProfileReference[];
		recentSearches: ProfileReference[];
		gender: 'Male' | 'Female' | 'Others' | null;
	};
};

export type ResponseType = {
	data: DataType;
	error: string;
	success: boolean;
	token: string;
};
