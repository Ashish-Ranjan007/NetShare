import * as dotenv from 'dotenv';

// Enviroment variable config
if (process.env.NODE_ENV !== 'PRODUCTION') {
	// This is only required in development as environment variables will be set on server during production
	dotenv.config();
}

import { app } from './app';
import { connectDatabase } from './database/database';

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
	console.log(`Error: ${err.message}`);
	console.log(`Shutting down the server due to Uncaught Exception`);
	process.exit(1);
});

// Connect to Database
connectDatabase();

// Spin-up the server
const server = app.listen(process.env.PORT, () => {
	console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (err: Error) => {
	console.log(`Error: ${err.message}`);
	console.log(`Shutting down the server due to Unhandled Promise Rejection`);

	server.close(() => {
		process.exit(1);
	});
});
