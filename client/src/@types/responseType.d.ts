type DataType = {
	userObj: {
		email: string;
		username: string;
		profilePic: string;
		recentSearches: {
			id: string;
			profilePic: string;
			username: string;
		}[];
	};
};

export type ResponseType = {
	data: DataType;
	error: string;
	success: boolean;
	token: string;
};
