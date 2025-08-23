module.exports = {
	extensionsToTreatAsEsm: [".ts"],
	verbose: true,
	preset: "ts-jest/presets/default-esm",
	transform: {
		"^.+\\.tsx?$": ["ts-jest", { useESM: true }],
	},
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.test.ts"],
	collectCoverageFrom: [
		"src/**/controllers/**.ts",
		"src/**/services/**.ts",
		"src/**/repositories/**.ts",
		"!src/**/*.d.ts",
		"!src/server.ts",
	],
	setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
	testTimeout: 30000,
	detectOpenHandles: true,
	forceExit: true,
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	transformIgnorePatterns: ["node_modules/(?!(marked|sanitize-html|turndown)/)"],
};
