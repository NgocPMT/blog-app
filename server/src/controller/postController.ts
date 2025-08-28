import type { Request, Response } from "express";
import db from "../db/queries.js";

const getAllPosts = async (req: Request, res: Response) => {
  const posts = await db.getAllPosts();
  res.json(posts);
};

export default { getAllPosts };
