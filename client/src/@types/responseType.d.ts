type DataType = {
	userObj: {
		email: string;
		username: string;
	};
};

export type ResponseType = {
	data: DataType;
	error: string;
	success: boolean;
	token: string;
};
