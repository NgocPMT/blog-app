import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import "dotenv/config";
import postRouter from "./routes/postRouter.js";
import "./config/passport.js";
import auth from "./routes/auth.js";
import userRouter from "./routes/userRouter.js";
import routeErrorHandling from "./middlewares/routeErrorHandling.js";
import internalErrorHandling from "./middlewares/internalErrorHandling.js";
import cors from "cors";
import imageRouter from "./routes/imageRouter.js";
import meRouter from "./routes/meRouter.js";
import reactionRouter from "./routes/reactionRouter.js";
import adminRouter from "./routes/adminRouter.js";
import reportedPostRouter from "./routes/reportedPostRouter.js";

const app: Express = express();

app.use(express.json());
const allowedOrigins = ["http://localhost:5173", "https://easium.netlify.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(auth);
app.use("/posts", postRouter);
app.use("/users", userRouter);
app.use("/me", meRouter);
app.use("/images", imageRouter);
app.use("/reactions", reactionRouter);
app.use("/admin", adminRouter);
app.use("/reported-posts", reportedPostRouter);
app.use(routeErrorHandling);
app.use(internalErrorHandling);

const PORT = process.env.PORT;

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App is running on PORT ${PORT}`);
});
