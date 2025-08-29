import express from "express";
import type { Express, Request, Response } from "express";
import "dotenv/config";
import postRouter from "./routes/postRouter.js";
import "../config/passport.js";
import auth from "./routes/auth.js";
import userRouter from "./routes/userRouter.js";

const app: Express = express();

app.use(express.json());

app.use(auth);
app.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Hello World" });
});
app.use("/posts", postRouter);
app.use("/users", userRouter);

const PORT = process.env.PORT;

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App is running on PORT ${PORT}`);
});
