import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
	// Start MongoDB Memory Server
	mongoServer = await MongoMemoryServer.create();
	const mongoUri = mongoServer.getUri();

	// Connect to the in-memory database
	await mongoose.connect(mongoUri);
});

afterAll(async () => {
	// Clean up
	await mongoose.disconnect();
	await mongoServer.stop();
});

afterEach(async () => {
	// Clean up database after each test
	const collections = mongoose.connection.collections;
	for (const key in collections) {
		const collection = collections[key];
		await collection.deleteMany({});
	}
});
