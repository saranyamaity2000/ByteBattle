import mongoose from "mongoose";

let isDockerTest = false;

beforeAll(async () => {
	// Check if we should use Docker MongoDB (set via environment variable)
	if (process.env.USE_DOCKER_MONGO === "true") {
		isDockerTest = true;
		const mongoUri =
			process.env.MONGO_TEST_URI ||
			"mongodb://testuser:testpass@localhost:27018/problemservice_test?authSource=admin";
		await mongoose.connect(mongoUri);
		console.log("Connected to Docker MongoDB for testing");
	}
	// Otherwise, use MongoDB Memory Server (from setup.ts)
});

afterAll(async () => {
	if (isDockerTest) {
		await mongoose.disconnect();
		console.log("Disconnected from Docker MongoDB");
	}
});

afterEach(async () => {
	if (isDockerTest) {
		// Clean up database after each test when using Docker
		const collections = mongoose.connection.collections;
		for (const key in collections) {
			const collection = collections[key];
			await collection.deleteMany({});
		}
	}
});
