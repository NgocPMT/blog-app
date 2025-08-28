import express from "express";
import type { Express, Request, Response } from "express";
import "dotenv/config";
import postRouter from "./routes/postRouter.js";

const app: Express = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Hello World" });
});

app.use("/posts", postRouter);

const PORT = process.env.PORT;

app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`App is running on PORT ${PORT}`);
});
