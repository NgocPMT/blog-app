import { Router } from "express";
import readingListController from "../controller/readingListController.js";
import savedPostRouter from "./savedPostRouter.js";

const readingListRouter = Router({ mergeParams: true });

readingListRouter.get("/", readingListController.handleGetUserReadingList);

readingListRouter.post("/", readingListController.handleCreateReadingList);

readingListRouter.put(
  "/:readingListId",
  readingListController.handleUpdateReadingList
);

readingListRouter.delete(
  "/:readingListId",
  readingListController.handleDeleteReadingList
);

readingListRouter.use("/:readingListId/saved-posts", savedPostRouter);

export default readingListRouter;
