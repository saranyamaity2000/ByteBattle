import { ObjectId, Collection, InsertOneResult, FindOneAndUpdateOptions } from "mongodb";
import { FastifyInstance } from "fastify";
import { ISubmission, UpdateSubmissionStatusRequest } from "../models/submission";

export class SubmissionRepository {
	private fastify: FastifyInstance;

	constructor(fastify: FastifyInstance) {
		this.fastify = fastify;
	}

	private get submissionsCollection(): Collection<ISubmission> {
		return this.fastify.mongo.db!.collection<ISubmission>("submissions");
	}

	async create(submissionData: Omit<ISubmission, "_id">): Promise<InsertOneResult<ISubmission>> {
		try {
			return await this.submissionsCollection.insertOne(submissionData);
		} catch (error) {
			this.fastify.log.error({ error }, "Error creating submission in database");
			throw new Error("Failed to create submission");
		}
	}

	async findById(id: string): Promise<ISubmission | null> {
		try {
			// Fix: Properly validate and convert string ID to ObjectId
			if (!ObjectId.isValid(id)) {
				return null;
			}

			return await this.submissionsCollection.findOne({ _id: new ObjectId(id) });
		} catch (error) {
			this.fastify.log.error({ error }, "Error finding submission by ID");
			throw new Error("Failed to find submission");
		}
	}

	async findByProblemId(problemId: string): Promise<ISubmission[]> {
		try {
			return await this.submissionsCollection
				.find({ problemId })
				.sort({ createdAt: -1 })
				.toArray();
		} catch (error) {
			this.fastify.log.error({ error }, "Error finding submissions by problem ID");
			throw new Error("Failed to find submissions by problem");
		}
	}

	async findByUserId(userId: string): Promise<ISubmission[]> {
		try {
			return await this.submissionsCollection
				.find({ userId })
				.sort({ createdAt: -1 })
				.toArray();
		} catch (error) {
			this.fastify.log.error({ error }, "Error finding submissions by user ID");
			throw new Error("Failed to find submissions by user");
		}
	}

	async updateById(
		id: string,
		updateData: UpdateSubmissionStatusRequest
	): Promise<ISubmission | null> {
		try {
			// Fix: Properly validate and convert string ID to ObjectId
			if (!ObjectId.isValid(id)) {
				return null;
			}

			const updateFields: Partial<ISubmission> = {
				status: updateData.status,
				updatedAt: new Date(),
			};

			if (updateData.result) {
				updateFields.result = updateData.result;
			}

			const options: FindOneAndUpdateOptions = {
				returnDocument: "after",
			};

			const result = await this.submissionsCollection.findOneAndUpdate(
				{ _id: new ObjectId(id) },
				{ $set: updateFields },
				options
			);

			return result || null;
		} catch (error) {
			this.fastify.log.error({ error }, "Error updating submission");
			throw new Error("Failed to update submission");
		}
	}

	async findAll(limit?: number, skip?: number): Promise<ISubmission[]> {
		try {
			const query = this.submissionsCollection.find({}).sort({ createdAt: -1 });

			if (skip) {
				query.skip(skip);
			}

			if (limit) {
				query.limit(limit);
			}

			return await query.toArray();
		} catch (error) {
			this.fastify.log.error({ error }, "Error finding all submissions");
			throw new Error("Failed to find submissions");
		}
	}

	async deleteById(id: string): Promise<boolean> {
		try {
			if (!ObjectId.isValid(id)) {
				return false;
			}

			const result = await this.submissionsCollection.deleteOne({ _id: new ObjectId(id) });
			return result.deletedCount > 0;
		} catch (error) {
			this.fastify.log.error({ error }, "Error deleting submission");
			throw new Error("Failed to delete submission");
		}
	}
}
