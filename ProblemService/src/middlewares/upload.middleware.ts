import multer from "multer";
import { BadRequestError } from "../utils/errors/app.error";
import path from "path";
import { NextFunction, Request, Response } from "express";

const jsonUploadMulter = multer({
	storage: multer.memoryStorage(),
	fileFilter: (_req, file, cb) => {
		// the uploaded file should in the form of json file.
		if (file.mimetype !== "application/json" || path.extname(file.originalname) !== ".json") {
			return cb(new BadRequestError("Only JSON files are allowed"));
		}
		cb(null, true);
	},
});

export async function uploadTestcaseFileMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	// Multer/Busboy parsing happens here; we await its completion
	await new Promise<void>((resolve, reject) => {
		jsonUploadMulter.single("file")(req, res, (err) => {
			// if we do not pass this , busboy internally will create new async context through callback
			if (err) return reject(err);
			resolve();
		});
	});
	next();
}
