import request from "supertest";
import app from "../app";

describe("Problem Controller Edge Cases", () => {
	describe("Validation Edge Cases", () => {
		it("should handle empty request body", async () => {
			const response = await request(app).post("/api/v1/problems").send({}).expect(400);

			expect(response.body).toHaveProperty("message");
			expect(response.body.success).toBe(false);
		});

		it("should handle extremely long title", async () => {
			const longTitle = "A".repeat(1000);
			const response = await request(app)
				.post("/api/v1/problems")
				.send({
					title: longTitle,
					slug: "long-title-test",
					statement: "Test statement",
					difficulty: "easy",
					examples: [],
					testcaseUrl: "https://s3.amazonaws.com/test-bucket/long-title-test.txt",
				})
				.expect(201);

			expect(response.body.data.title).toBe(longTitle);
		});

		it("should handle special characters in slug", async () => {
			const response = await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Special Characters Problem!@#$%",
					statement: "Test statement",
					difficulty: "easy",
					examples: [],
					testcaseUrl: "https://s3.amazonaws.com/test-bucket/special-chars-test.txt",
				})
				.expect(201);

			// Should auto-generate a clean slug
			expect(response.body.data.slug).toMatch(/^[a-z0-9-]+$/);
		});

		it("should handle invalid difficulty values", async () => {
			await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Test Problem",
					slug: "test-problem",
					statement: "Test statement",
					difficulty: "super-hard", // invalid difficulty
					examples: [],
					testcaseUrl: "https://s3.amazonaws.com/test-bucket/invalid-difficulty-test.txt",
				})
				.expect(400);
		});

		it("should handle invalid URL in testcaseUrl", async () => {
			await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Test Problem",
					slug: "test-problem-invalid-url",
					statement: "Test statement",
					difficulty: "easy",
					examples: [],
					testcaseUrl: "not-a-valid-url",
				})
				.expect(400);
		});
	});

	describe("Large Data Handling", () => {
		it("should handle problems with many examples", async () => {
			const manyExamples = Array.from({ length: 50 }, (_, i) => ({
				input: `Example input ${i}`,
				output: `Example output ${i}`,
				explanation: `Explanation for example ${i}`,
			}));

			const response = await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Problem with Many Examples",
					slug: "many-examples-problem",
					statement: "A problem with many examples",
					difficulty: "medium",
					examples: manyExamples,
					testcaseUrl: "https://s3.amazonaws.com/test-bucket/many-examples-testcases.txt",
				})
				.expect(201);

			expect(response.body.data.examples).toHaveLength(50);
		});

		it("should handle testcase URL validation", async () => {
			const response = await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Problem with Testcase URL",
					slug: "testcase-url-problem",
					statement: "A problem with testcase URL validation",
					difficulty: "hard",
					examples: [],
					testcaseUrl: "https://s3.amazonaws.com/test-bucket/complex-testcases.txt",
				})
				.expect(201);

			expect(response.body.data.testcaseUrl).toBe(
				"https://s3.amazonaws.com/test-bucket/complex-testcases.txt"
			);
		});

		it("should handle very long problem statement", async () => {
			const longStatement = "Lorem ipsum ".repeat(1000); // Very long statement

			const response = await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Problem with Long Statement",
					slug: "long-statement-problem",
					statement: longStatement,
					difficulty: "easy",
					examples: [],
					testcaseUrl:
						"https://s3.amazonaws.com/test-bucket/long-statement-testcases.txt",
				})
				.expect(201);

			expect(response.body.data.statement).toBe(longStatement);
		});
	});

	describe("Boundary Value Testing", () => {
		it("should handle minimum time limit", async () => {
			const response = await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Min Time Limit Problem",
					slug: "min-time-limit",
					statement: "Test statement",
					difficulty: "easy",
					examples: [],
					testcaseUrl:
						"https://s3.amazonaws.com/test-bucket/min-time-limit-testcases.txt",
					timeLimitMs: 1, // minimum possible
				})
				.expect(201);

			expect(response.body.data.timeLimitMs).toBe(1);
		});

		it("should handle maximum memory limit", async () => {
			const response = await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Max Memory Limit Problem",
					slug: "max-memory-limit",
					statement: "Test statement",
					difficulty: "easy",
					examples: [],
					testcaseUrl:
						"https://s3.amazonaws.com/test-bucket/max-memory-limit-testcases.txt",
					memoryLimitKb: 1048576, // 1GB in KB
				})
				.expect(201);

			expect(response.body.data.memoryLimitKb).toBe(1048576);
		});

		it("should handle negative values gracefully", async () => {
			await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Negative Values Problem",
					slug: "negative-values",
					statement: "Test statement",
					difficulty: "easy",
					examples: [],
					testcaseUrl:
						"https://s3.amazonaws.com/test-bucket/negative-values-testcases.txt",
					timeLimitMs: -100, // negative time
					memoryLimitKb: -1000, // negative memory
				})
				.expect(400);
		});
	});

	describe("Unicode and Internationalization", () => {
		it("should handle unicode characters in title", async () => {
			const unicodeTitle = "두 수의 합 🔢 Math Problem";

			const response = await request(app)
				.post("/api/v1/problems")
				.send({
					title: unicodeTitle,
					slug: "unicode-problem",
					statement: "Unicode problem statement with emojis 🚀",
					difficulty: "easy",
					examples: [],
					testcaseUrl: "https://s3.amazonaws.com/test-bucket/unicode-testcases.txt",
				})
				.expect(201);

			expect(response.body.data.title).toBe(unicodeTitle);
		});

		it("should handle right-to-left text", async () => {
			const rtlText = "مسألة الرياضيات"; // Arabic text

			const response = await request(app)
				.post("/api/v1/problems")
				.send({
					title: rtlText,
					slug: "rtl-problem",
					statement: "Problem with RTL text",
					difficulty: "medium",
					examples: [],
					testcaseUrl: "https://s3.amazonaws.com/test-bucket/rtl-testcases.txt",
				})
				.expect(201);

			expect(response.body.data.title).toBe(rtlText);
		});
	});

	describe("Race Conditions and Concurrency", () => {
		it("should handle concurrent problem creation", async () => {
			const problemData = (index: number) => ({
				title: `Concurrent Problem ${index}`,
				slug: `concurrent-problem-${index}`,
				statement: `Statement for problem ${index}`,
				difficulty: "easy" as const,
				examples: [],
				testcaseUrl: `https://s3.amazonaws.com/test-bucket/concurrent-problem-${index}-testcases.txt`,
			});

			// Create 10 problems concurrently
			const promises = Array.from({ length: 10 }, (_, i) =>
				request(app).post("/api/v1/problems").send(problemData(i))
			);

			const responses = await Promise.all(promises);

			// All should succeed
			responses.forEach((response, index) => {
				expect(response.status).toBe(201);
				expect(response.body.data.title).toBe(`Concurrent Problem ${index}`);
			});
		});

		it("should handle concurrent updates to the same problem", async () => {
			// First create a problem
			const createResponse = await request(app).post("/api/v1/problems").send({
				title: "Concurrent Update Problem",
				slug: "concurrent-update",
				statement: "Original statement",
				difficulty: "easy",
				examples: [],
				testcaseUrl: "https://s3.amazonaws.com/test-bucket/concurrent-update-testcases.txt",
			});

			const slug = createResponse.body.data.slug;

			// Try to update concurrently
			const updatePromises = [
				request(app).put(`/api/v1/problems/${slug}`).send({ likes: 10 }),
				request(app).put(`/api/v1/problems/${slug}`).send({ likes: 20 }),
				request(app).put(`/api/v1/problems/${slug}`).send({ likes: 30 }),
			];

			const updateResponses = await Promise.all(updatePromises);

			// All updates should succeed (last one wins)
			updateResponses.forEach((response) => {
				expect(response.status).toBe(200);
			});
		});
	});
});
