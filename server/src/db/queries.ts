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

interface Comment {
  content: string;
  postId: number;
  userId: number;
}

const prisma = new PrismaClient();

const getAllPosts = async () => {
  const posts = await prisma.post.findMany();
  return posts;
};

// For validate post model's unique fields
const getPostByTitleAndUserId = async (title: string, userId: number) => {
  const post = await prisma.post.findFirst({
    where: { title: { equals: title, mode: "insensitive" }, userId },
  });
  return post ?? null;
};

const createPost = async (post: Post) => {
  const { title, content, userId } = post;
  const createdPost = await prisma.post.create({
    data: {
      title,
      content,
      user: { connect: { id: userId } },
    },
  });
  return createdPost;
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
  const post = await prisma.post.update({
    where: {
      id,
    },
    data: {
      title,
      content,
    },
  });
  return post;
};

const deletePost = async (id: number) => {
  const post = await prisma.post.delete({ where: { id } });
  return post;
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

const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  return user ?? null;
};

const getUserInformation = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { username: true, email: true },
  });
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

const getCommentsByPostId = async (postId: number) => {
  const comments = await prisma.comment.findMany({
    where: { postId },
  });
  return comments;
};

const getCommentById = async (id: number) => {
  const comment = await prisma.comment.findUnique({ where: { id } });
  return comment ?? null;
};

const createComment = async (comment: Comment) => {
  const { content, postId, userId } = comment;
  const createdComment = await prisma.comment.create({
    data: {
      content,
      post: { connect: { id: postId } },
      user: { connect: { id: userId } },
    },
  });
  return createdComment;
};

const updateComment = async ({
  id,
  content,
}: {
  id: number;
  content: string;
}) => {
  const comment = await prisma.comment.update({
    where: {
      id,
    },
    data: {
      content,
    },
  });
  return comment;
};

const deleteComment = async (id: number) => {
  const comment = await prisma.comment.delete({
    where: { id },
  });
  return comment;
};

export default {
  getAllPosts,
  getPostById,
  getPostByTitleAndUserId,
  createPost,
  updatePost,
  deletePost,
  getUserById,
  getUserInformation,
  getUserByUsername,
  getUserByEmail,
  createUser,
  getCommentsByPostId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};
