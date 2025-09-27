import express from "express";
import cors from "cors";
import v1Router from "./routers/v1/index.router";
import v2Router from "./routers/v2/index.router";
import { appErrorHandler, genericErrorHandler } from "./middlewares/error.middleware";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";
import { serverConfig } from "./config";

const app = express();
app.use(
	cors({
		origin: serverConfig.ALLOWED_ORIGINS,
		credentials: true, // Allow credentials
	})
);

app.use(express.json());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

/**
 * Add the error handler middleware
 */

app.use(appErrorHandler);
app.use(genericErrorHandler);

export default app;
