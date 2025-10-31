import { PrismaClient, PostStatus } from "@prisma/client";
interface User {
  username: string;
  email: string;
  password: string;
}

interface Post {
  title: string;
  slug: string;
  content: string;
  userId: number;
  status?: PostStatus;
  coverImageUrl?: string;
}

interface Comment {
  content: string;
  postId: number;
  userId: number;
}

interface Profile {
  userId: number;
  name: string;
  avatarUrl: string;
  bio: string;
}

const prisma = new PrismaClient();

const getPublishedPosts = async (
  page: number,
  limit: number,
  searchQuery: string | null
) => {
  const posts = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: {
      status: "PUBLISHED",
      title: searchQuery ? { contains: searchQuery, mode: "insensitive" } : {},
    },
    include: {
      user: true,
      PostReaction: true,
      PostTopic: true,
      PostView: true,
      comments: true,
      publication: true,
    },
  });
  return posts;
};

const getPostByTitleAndUserId = async (title: string, userId: number) => {
  const post = await prisma.post.findFirst({
    where: { title: { equals: title, mode: "insensitive" }, userId },
    include: {
      user: true,
      PostReaction: true,
      PostTopic: true,
      PostView: true,
      comments: true,
      publication: true,
    },
  });
  return post ?? null;
};

const createPost = async (post: Post) => {
  const { title, slug, content, userId, status, coverImageUrl } = post;
  const createdPost = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      user: { connect: { id: userId } },
      status,
      coverImageUrl,
    },
  });

  return createdPost;
};

const doesSlugExist = async (slug: string) => {
  const dbSlug = await prisma.post.findUnique({
    where: { slug },
  });

  if (dbSlug) {
    return true;
  }
  return false;
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
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: true,
      PostReaction: true,
      PostTopic: true,
      PostView: true,
      comments: true,
      publication: true,
    },
  });
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
    omit: {
      password: true,
    },
  });
  return user ?? null;
};

const getUserProfile = async (id: number) => {
  const user = await prisma.profile.findUnique({
    where: { userId: id },
  });
  return user ?? null;
};

const updateProfile = async (profile: Profile) => {
  const { userId, name, avatarUrl, bio } = profile;
  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: {
      name,
      avatarUrl,
      bio,
    },
    omit: {
      id: true,
      userId: true,
    },
  });
  return updatedProfile;
};

const getUserNotifications = async (id: number) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: id },
  });
  return notifications;
};

const getUserFollowers = async (id: number) => {
  const followers = await prisma.userFollows.findMany({
    where: { followingId: id },
    include: {
      followedBy: {
        select: {
          id: true,
          Profile: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });
  return followers;
};

const getUserFollowings = async (id: number) => {
  const followings = await prisma.userFollows.findMany({
    where: { followedById: id },
    include: {
      following: {
        select: {
          id: true,
          Profile: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });
  return followings;
};

const getUserStatistics = async (id: number) => {
  const follows = await prisma.userFollows.findMany({
    where: { followingId: id },
    select: { followedAt: true },
  });
  const posts = await prisma.post.findMany({
    where: { userId: id },
    select: {
      title: true,
      slug: true,
      createdAt: true,
      PostView: { select: { viewedAt: true } },
      PostReaction: { select: { reactedAt: true } },
    },
  });

  return { follows, posts };
};

const getUserSavedPosts = async (id: number) => {
  const savedPosts = await prisma.readingList.findMany({
    where: { userId: id },
    include: {
      post: { include: { PostReaction: true, comments: true } },
    },
  });
  return savedPosts;
};

const getUserPosts = async (userId: number) => {
  const posts = await prisma.post.findMany({
    where: { userId },
    include: {
      user: true,
      PostReaction: true,
      PostTopic: true,
      PostView: true,
      comments: true,
      publication: true,
    },
  });
  return posts;
};

const createUser = async (user: User) => {
  const { username, email, password } = user;
  await prisma.user.create({
    data: {
      username,
      email,
      password,
      Profile: {
        create: {
          name: username,
          bio: "",
          avatarUrl: null,
        },
      },
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
  getPublishedPosts,
  getPostById,
  getPostByTitleAndUserId,
  createPost,
  updatePost,
  deletePost,
  doesSlugExist,
  getUserById,
  getUserInformation,
  getUserProfile,
  updateProfile,
  getUserByUsername,
  getUserByEmail,
  getUserPosts,
  getUserNotifications,
  getUserFollowers,
  getUserFollowings,
  getUserStatistics,
  getUserSavedPosts,
  createUser,
  getCommentsByPostId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};
