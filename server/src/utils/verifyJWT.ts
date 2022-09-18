import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

// verify jwt
export function verifyJWT(token: string, secret: string) {
	try {
		const decoded = jwt.verify(token, secret);

		return { payload: decoded as JwtPayload, invalid: false };
	} catch (error: any) {
		return {
			payload: {} as JwtPayload,
			invalid: true,
		};
	}
}
