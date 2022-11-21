export type ProfileReference = {
	id: string;
	profilePic: string;
	username: string;
};

type NotificationType = {
	user: ProfileReference;
	action: 'like' | 'comment' | 'follow';
	contentType: 'comment' | 'post' | 'profile';
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
		followersCount: number;
		followingsCount: number;
		friends: ProfileReference[];
		followers: ProfileReference[];
		followings: ProfileReference[];
		notifications: NotificationType[];
		recentSearches: ProfileReference[];
	};
};

export type ResponseType = {
	data: DataType;
	error: string;
	success: boolean;
	token: string;
};
