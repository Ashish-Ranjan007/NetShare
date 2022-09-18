import { Request } from 'express';
import { User } from '../custom';

// to make the file a module and avoid the TypeScript error
export {};

declare global {
	namespace Express {
		interface Request {
			user?: any; //any -> User
		}
	}
}
