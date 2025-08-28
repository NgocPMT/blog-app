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

const updatePost = async ({
  id,
  title,
  content,
}: {
  id: number;
  title: string;
  content: string;
}) => {
  await prisma.post.update({
    where: {
      id,
    },
    data: {
      title,
      content,
    },
  });
};

const deletePost = async (id: number) => {
  await prisma.post.delete({ where: { id } });
};

const getPostById = async (id: number) => {
  const post = await prisma.post.findUnique({ where: { id } });
  return post ?? null;
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
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getUserById,
  getUserByUsername,
  createUser,
};
