import * as dotenv from 'dotenv';

// Enviroment variable config
if (process.env.NODE_ENV !== 'PRODUCTION') {
	// This is only required in development as environment variables will be set on server during production
	dotenv.config();
}

import http from 'http';
import { Server, Socket } from 'socket.io';

import { app } from './app';
import { onConnection } from './socket/connections';
import { connectDatabase } from './database/database';

// Handling Uncaught Exception
process.on('uncaughtException', (err) => {
	console.log(`Error: ${err.message}`);
	console.log(`Shutting down the server due to Uncaught Exception`);
	process.exit(1);
});

// Connect to Database
connectDatabase();

// Initialize an http Server instance
const server = http.createServer(app);

// Initialize socket.io Server instance
const io = new Server(server, {
	cors: {
		origin: 'http://localhost:5173',
	},
	pingTimeout: 60000,
});

// Integrate socket.io connection handlers to the io instance
io.on('connection', (socket: Socket) => {
	onConnection(io, socket);
});

// Spin-up the server
server.listen(process.env.PORT, () => {
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
