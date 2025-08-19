module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.test.ts"],
	collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/server.ts"],
	setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
	testTimeout: 30000,
	detectOpenHandles: true,
	forceExit: true,
};
