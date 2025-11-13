import { Router } from "express";
import reportedPostController from "../controller/reportedPostController.js";

const reportedPostRouter = Router();

reportedPostRouter.post("/", reportedPostController.handleReportPost);

export default reportedPostRouter;
