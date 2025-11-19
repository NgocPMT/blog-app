import { Router } from "express";
import imageController from "../controller/imageController.js";

const imageRouter = Router();

imageRouter.post("/upload", imageController.handleUploadPostImage);

imageRouter.post("/upload-avatar", imageController.handleUploadAvatar);

export default imageRouter;
