import { Router } from "express";
import adminController from "../controller/adminController.js";

const adminRouter = Router();

adminRouter.get("/reported-posts", adminController.getReportedPosts);

adminRouter.get("/users", adminController.getUsers);

adminRouter.put("/users/user/:id/activate", adminController.handleActivateUser);

adminRouter.put(
  "/users/user/:id/activate",
  adminController.handleDeactivateUser
);

export default adminRouter;
