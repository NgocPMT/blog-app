import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAllPosts = async (req, res) => {
  const posts = await prisma.post.findMany();
  res.json(posts);
};

export default { getAllPosts };
