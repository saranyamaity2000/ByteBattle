import express from "express";
import { problemRouter } from "./problem.router";
import { testcaseRouter } from "./testcase.router";

const v1Router = express.Router();

v1Router.use("/problems", problemRouter);
v1Router.use("/testcases", testcaseRouter);

export default v1Router;
