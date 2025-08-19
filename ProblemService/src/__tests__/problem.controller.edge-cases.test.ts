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
					testcases: [],
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
					testcases: [],
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
					testcases: [],
				})
				.expect(400);
		});

		it("should handle invalid URL in testcases", async () => {
			await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Test Problem",
					slug: "test-problem-invalid-url",
					statement: "Test statement",
					difficulty: "easy",
					examples: [],
					testcases: [
						{
							testcaseName: "Test Case 1",
							url: "not-a-valid-url",
						},
					],
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
					testcases: [],
				})
				.expect(201);

			expect(response.body.data.examples).toHaveLength(50);
		});

		it("should handle problems with many testcases", async () => {
			const manyTestcases = Array.from({ length: 100 }, (_, i) => ({
				testcaseName: `Test Case ${i}`,
				url: `https://s3.amazonaws.com/test-bucket/testcase-${i}.txt`,
			}));

			const response = await request(app)
				.post("/api/v1/problems")
				.send({
					title: "Problem with Many Testcases",
					slug: "many-testcases-problem",
					statement: "A problem with many testcases",
					difficulty: "hard",
					examples: [],
					testcases: manyTestcases,
				})
				.expect(201);

			expect(response.body.data.testcases).toHaveLength(100);
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
					testcases: [],
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
					testcases: [],
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
					testcases: [],
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
					testcases: [],
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
					testcases: [],
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
					testcases: [],
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
				testcases: [],
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
				testcases: [],
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
