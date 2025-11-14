import { Router } from "express";
import adminController from "../controller/adminController.js";

const adminRouter = Router();

adminRouter.get("/reported-posts", adminController.getReportedPosts);

adminRouter.delete("/reported-post", adminController.handleClearReportedPosts);

adminRouter.get("/users", adminController.getUsers);

adminRouter.put(
  "/users/user/:userId/activate",
  adminController.handleActivateUser
);

adminRouter.put(
  "/users/user/:userId/deactivate",
  adminController.handleDeactivateUser
);

export default adminRouter;
