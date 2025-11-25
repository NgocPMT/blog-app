import { Router } from "express";
import readingListController from "../controller/readingListController.js";
import savedPostRouter from "./savedPostRouter.js";
import validate from "../middlewares/validate.js";
import { readingListIdParamValidation } from "../validation/validation.js";

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

readingListRouter.use(
  "/:readingListId/saved-posts",
  ...validate(readingListIdParamValidation),
  savedPostRouter
);

export default readingListRouter;
