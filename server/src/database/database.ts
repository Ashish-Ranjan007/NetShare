import mongoose from 'mongoose';

const connectDatabase = (): void => {
	mongoose.connect(process.env.DB_URI as string).then((data) => {
		console.log(`Mongodb connected with server: ${data.connection.host}`);
	});
};

export { connectDatabase };
