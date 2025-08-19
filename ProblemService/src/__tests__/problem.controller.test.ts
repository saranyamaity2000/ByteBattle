import request from "supertest";
import app from "../app";

describe("Problem Controller Integration Tests", () => {
	const mockProblemData = {
		title: "Two Sum",
		slug: "two-sum",
		statement:
			"Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
		difficulty: "easy" as const,
		examples: [
			{
				input: "nums = [2,7,11,15], target = 9",
				output: "[0,1]",
				explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
			},
		],
		testcases: [
			{
				testcaseName: "Basic Test Case 1",
				url: "https://s3.amazonaws.com/test-bucket/two-sum-test1.txt",
			},
		],
		constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
		timeLimitMs: 1000,
		memoryLimitKb: 65536,
		author: "test-author",
		isPublished: false,
		isPremium: false,
		editorial: "This is a classic problem that can be solved using a hash map.",
		topicTags: ["Array", "Hash Table"],
		companyTags: ["Amazon", "Google"],
	};

	describe("POST /api/v1/problems", () => {
		it("should create a new problem successfully", async () => {
			const response = await request(app)
				.post("/api/v1/problems")
				.send(mockProblemData)
				.expect(201);

			expect(response.body.data).toBeDefined();
			expect(response.body.data.title).toBe(mockProblemData.title);
			expect(response.body.data.slug).toBe(mockProblemData.slug);
			expect(response.body.data.difficulty).toBe(mockProblemData.difficulty);
			expect(response.body.data.examples).toHaveLength(1);
			expect(response.body.data.testcases).toHaveLength(1);
			expect(response.body.data.createdAt).toBeDefined();
			expect(response.body.data.updatedAt).toBeDefined();
		});

		it("should create a problem with minimal required fields", async () => {
			const minimalData = {
				title: "Minimal Problem",
				slug: "minimal-problem",
				statement: "A minimal problem statement",
				difficulty: "medium" as const,
				examples: [],
				testcases: [],
			};

			const response = await request(app)
				.post("/api/v1/problems")
				.send(minimalData)
				.expect(201);

			expect(response.body.data.title).toBe(minimalData.title);
			expect(response.body.data.isPublished).toBe(false); // default value
			expect(response.body.data.submissionsCount).toBe(0); // default value
		});

		it("should return 400 for invalid problem data", async () => {
			const invalidData = {
				title: "", // empty title should fail validation
				difficulty: "invalid-difficulty",
			};

			await request(app).post("/api/v1/problems").send(invalidData).expect(400);
		});
	});

	describe("GET /api/v1/problems", () => {
		beforeEach(async () => {
			// Create a test problem
			await request(app).post("/api/v1/problems").send(mockProblemData);
		});

		it("should get all problems", async () => {
			const response = await request(app).get("/api/v1/problems").expect(200);

			expect(Array.isArray(response.body.data)).toBe(true);
			expect(response.body.data.length).toBeGreaterThan(0);
			expect(response.body.data[0]).toHaveProperty("title");
			expect(response.body.data[0]).toHaveProperty("slug");
			expect(response.body.data[0]).toHaveProperty("difficulty");
		});

		it("should return empty array when no problems exist", async () => {
			// Clear all problems first
			await request(app).delete(`/api/v1/problems/${mockProblemData.slug}`);

			const response = await request(app).get("/api/v1/problems").expect(200);

			expect(Array.isArray(response.body.data)).toBe(true);
			expect(response.body.data.length).toBe(0);
		});
	});

	describe("GET /api/v1/problems/:slug", () => {
		beforeEach(async () => {
			// Create a test problem
			await request(app).post("/api/v1/problems").send(mockProblemData);
		});

		it("should get a problem by slug", async () => {
			const response = await request(app)
				.get(`/api/v1/problems/${mockProblemData.slug}`)
				.expect(200);

			expect(response.body.data).toBeDefined();
			expect(response.body.data.slug).toBe(mockProblemData.slug);
			expect(response.body.data.title).toBe(mockProblemData.title);
			expect(response.body.data.difficulty).toBe(mockProblemData.difficulty);
			expect(response.body.data.examples).toHaveLength(1);
			expect(response.body.data.testcases).toHaveLength(1);
		});

		it("should return null for non-existent slug", async () => {
			const response = await request(app)
				.get("/api/v1/problems/non-existent-slug")
				.expect(200);

			expect(response.body.data).toBeNull();
		});
	});

	describe("PUT /api/v1/problems/:slug", () => {
		beforeEach(async () => {
			// Create a test problem
			await request(app).post("/api/v1/problems").send(mockProblemData);
		});

		it("should update a problem by slug", async () => {
			const updateData = {
				title: "Updated Two Sum",
				difficulty: "hard" as const,
				isPublished: true,
				likes: 100,
			};

			const response = await request(app)
				.put(`/api/v1/problems/${mockProblemData.slug}`)
				.send(updateData)
				.expect(200);

			expect(response.body.data).toBeDefined();
			expect(response.body.data.title).toBe(updateData.title);
			expect(response.body.data.difficulty).toBe(updateData.difficulty);
			expect(response.body.data.isPublished).toBe(updateData.isPublished);
			expect(response.body.data.likes).toBe(updateData.likes);
			expect(response.body.data.slug).toBe(mockProblemData.slug); // slug should remain same
		});

		it("should partially update a problem", async () => {
			const partialUpdate = {
				isPublished: true,
			};

			const response = await request(app)
				.put(`/api/v1/problems/${mockProblemData.slug}`)
				.send(partialUpdate)
				.expect(200);

			expect(response.body.data.isPublished).toBe(true);
			expect(response.body.data.title).toBe(mockProblemData.title); // unchanged
		});

		it("should return null for updating non-existent problem", async () => {
			const updateData = { title: "Updated Title" };

			const response = await request(app)
				.put("/api/v1/problems/non-existent-slug")
				.send(updateData)
				.expect(200);

			expect(response.body.data).toBeNull();
		});

		it("should validate update data", async () => {
			const invalidUpdate = {
				difficulty: "invalid-difficulty",
			};

			await request(app)
				.put(`/api/v1/problems/${mockProblemData.slug}`)
				.send(invalidUpdate)
				.expect(400);
		});
	});

	describe("DELETE /api/v1/problems/:slug", () => {
		beforeEach(async () => {
			// Create a test problem
			await request(app).post("/api/v1/problems").send(mockProblemData);
		});

		it("should delete a problem by slug", async () => {
			const response = await request(app)
				.delete(`/api/v1/problems/${mockProblemData.slug}`)
				.expect(200);

			expect(response.body.message).toContain("deleted successfully");
			expect(response.body.message).toContain(mockProblemData.slug);

			// Verify the problem is actually deleted
			const getResponse = await request(app)
				.get(`/api/v1/problems/${mockProblemData.slug}`)
				.expect(200);

			expect(getResponse.body.data).toBeNull();
		});

		it("should return success message even for non-existent problem", async () => {
			const response = await request(app)
				.delete("/api/v1/problems/non-existent-slug")
				.expect(200);

			expect(response.body.message).toContain("deleted successfully");
		});
	});

	describe("Error Handling", () => {
		it("should handle database connection errors gracefully", async () => {
			// This test would need to mock mongoose connection failure
			// For now, we'll test that our error middleware catches errors

			// Test with malformed request
			const response = await request(app)
				.post("/api/v1/problems")
				.send("invalid json")
				.expect(400);

			expect(response.body).toHaveProperty("message");
		});
	});

	describe("Data Integrity", () => {
		it("should auto-generate slug from title if not provided", async () => {
			const dataWithoutSlug = {
				title: "Problem Without Slug!",
				statement: "Test statement",
				difficulty: "easy" as const,
				examples: [],
				testcases: [],
			};

			const response = await request(app)
				.post("/api/v1/problems")
				.send(dataWithoutSlug)
				.expect(201);

			expect(response.body.data.slug).toBeDefined();
			expect(response.body.data.slug).toBe("problem-without-slug");
		});

		it("should enforce unique slug constraint", async () => {
			// Create first problem
			await request(app).post("/api/v1/problems").send(mockProblemData).expect(201);

			// Try to create another problem with same slug
			const duplicateData = {
				...mockProblemData,
				title: "Different Title",
			};

			await request(app).post("/api/v1/problems").send(duplicateData).expect(500); // Should fail due to unique constraint
		});

		it("should set default values correctly", async () => {
			const minimalData = {
				title: "Test Problem",
				slug: "test-problem-defaults",
				statement: "Test statement",
				difficulty: "easy" as const,
				examples: [],
				testcases: [],
			};

			const response = await request(app)
				.post("/api/v1/problems")
				.send(minimalData)
				.expect(201);

			expect(response.body.data.isPublished).toBe(false);
			expect(response.body.data.isPremium).toBe(false);
			expect(response.body.data.submissionsCount).toBe(0);
			expect(response.body.data.likes).toBe(0);
			expect(response.body.data.timeLimitMs).toBe(1000);
			expect(response.body.data.memoryLimitKb).toBe(65536);
			expect(Array.isArray(response.body.data.constraints)).toBe(true);
			expect(Array.isArray(response.body.data.topicTags)).toBe(true);
			expect(Array.isArray(response.body.data.companyTags)).toBe(true);
		});
	});
});
