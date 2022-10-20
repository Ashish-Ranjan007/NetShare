export type ProfileReference = {
	id: string;
	profilePic: string;
	username: string;
};

type DataType = {
	userObj: {
		id: string;
		email: string;
		username: string;
		profilePic: string;
		friends: ProfileReference[];
		followers: ProfileReference[];
		followings: ProfileReference[];
		recentSearches: ProfileReference[];
	};
};

export type ResponseType = {
	data: DataType;
	error: string;
	success: boolean;
	token: string;
};
