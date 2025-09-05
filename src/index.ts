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

const app: Express = express();

app.use(express.json());
app.use(cors());

app.use(auth);
app.use("/posts", postRouter);
app.use("/users", userRouter);
app.use(routeErrorHandling);
app.use(internalErrorHandling);

const PORT = process.env.PORT;

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App is running on PORT ${PORT}`);
});
