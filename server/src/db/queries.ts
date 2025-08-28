import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAllPosts = async () => {
  const posts = await prisma.post.findMany();
  return posts;
};

export default { getAllPosts };
