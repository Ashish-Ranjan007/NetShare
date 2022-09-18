export class ResponseData {
	data: any;
	success: boolean;
	error: string | undefined;
	token: string | undefined;

	constructor(success: boolean, data?: any, error?: string, token?: string) {
		this.success = success;
		this.data = data || {};
		this.error = error || '';
		this.token = token;
	}
}
