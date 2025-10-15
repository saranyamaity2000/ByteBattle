import createError from "@fastify/error";

export const NotFoundError = createError<[string]>("NOT_FOUND", "Resource Not Found |", 404);
export const InternalServerError = createError(
	"INTERNAL_SERVER_ERROR",
	"Internal Server Error |",
	500
);
export const BadRequestError = createError<[string]>("BAD_REQUEST", "Bad Request", 400);
export const ExternalServiceError = createError<[string]>(
	"EXTERNAL_SERVICE_ERROR",
	"External Service Error |",
	502
);
