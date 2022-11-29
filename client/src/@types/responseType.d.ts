export type ProfileReference = {
	id: string;
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

type DataType = {
	userObj: {
		id: string;
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
