import { PrismaClient } from "@prisma/client";
interface User {
  username: string;
  email: string;
  password: string;
}

interface Post {
  title: string;
  content: string;
  userId: number;
}

const prisma = new PrismaClient();

const getAllPosts = async () => {
  const posts = await prisma.post.findMany();
  return posts;
};

const createPost = async (post: Post) => {
  const { title, content, userId } = post;
  await prisma.post.create({
    data: {
      title,
      content,
      user: { connect: { id: userId } },
    },
  });
};

const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ?? null;
};

const getUserByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({ where: { username } });
  return user ?? null;
};

const createUser = async (user: User) => {
  const { username, email, password } = user;
  await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });
};

export default {
  getAllPosts,
  getUserById,
  getUserByUsername,
  createUser,
  createPost,
};
