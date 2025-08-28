import { PrismaClient } from "@prisma/client";
interface User {
  username: string;
  email: string;
  password: string;
}

const prisma = new PrismaClient();

const getAllPosts = async () => {
  const posts = await prisma.post.findMany();
  return posts;
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

export default { getAllPosts, getUserById, getUserByUsername, createUser };
