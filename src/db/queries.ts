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
  if (searchQuery) {
    const posts = await prisma.$queryRaw`
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p."coverImageUrl", 
        p.slug, 
        p."createdAt",
        p."userId",
        p."publicationId",
        json_build_object(
          'id', u.id,
          'email', u.email,
          'username', u.username,
          'Profile', (SELECT row_to_json(prof.*) FROM "Profile" prof WHERE prof."userId" = u.id)
        ) as user,
        COALESCE((
          SELECT json_agg(pr.*)
          FROM "PostReaction" pr
          WHERE pr."postId" = p.id
        ), '[]'::json) as "PostReaction",
        COALESCE((
          SELECT json_agg(pt.*)
          FROM "PostTopic" pt
          WHERE pt."postId" = p.id
        ), '[]'::json) as "PostTopic",
        COALESCE((
          SELECT json_agg(pv.*)
          FROM "PostView" pv
          WHERE pv."postId" = p.id
        ), '[]'::json) as "PostView",
        COALESCE((
          SELECT json_agg(c.*)
          FROM "Comment" c
          WHERE c."postId" = p.id
        ), '[]'::json) as comments,
        (
          SELECT row_to_json(pub.*)
          FROM "Publication" pub
          WHERE pub.id = p."publicationId"
        ) as publication,
        -- Calculate relevance score using TEXT fields only
        (
          similarity(p.title::text, ${searchQuery}) * 3 +
          similarity(u.username::text, ${searchQuery}) * 2
        ) as relevance_score
      FROM "Post" p
      INNER JOIN "User" u ON p."userId" = u.id
      WHERE 
        p.status = 'PUBLISHED'
        AND (
          p.title ILIKE ${"%" + searchQuery + "%"}
          OR u.username ILIKE ${"%" + searchQuery + "%"}
          OR p.title % ${searchQuery}
          OR u.username % ${searchQuery}
        )
      ORDER BY relevance_score DESC, p."createdAt" DESC
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit}
    `;

    return posts;
  }

  // Regular query without search
  return prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { status: "PUBLISHED" },
    include: {
      user: {
        include: {
          Profile: true,
        },
      },
      PostReaction: true,
      PostTopic: true,
      PostView: true,
      comments: true,
      publication: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPostBySlug = async (slug: string) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          Profile: true,
          username: true,
        },
      },
      PostReaction: {
        include: {
          reactionType: true,
        },
      },
      PostView: true,
      PostTopic: true,
      comments: true,
    },
  });
  return post || null;
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

const reactPost = async (
  reactionTypeId: number,
  postId: number,
  userId: number
) => {
  await prisma.postReaction.create({
    data: {
      postId,
      userId,
      reactionTypeId,
    },
  });
};

const unreactPost = async (postId: number, userId: number) => {
  await prisma.postReaction.delete({
    where: { userId_postId: { postId, userId } },
  });
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
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          Profile: true,
        },
      },
      PostReaction: true,
      PostTopic: true,
      PostView: true,
      comments: true,
      publication: true,
    },
  });
  return post ?? null;
};

const getReactionTypeById = async (id: number) => {
  const reactionType = await prisma.reactionType.findUnique({ where: { id } });
  return reactionType || null;
};

const isReacted = async (postId: number, userId: number) => {
  const isReacted = await prisma.postReaction.findUnique({
    where: { userId_postId: { postId, userId } },
  });
  return !!isReacted;
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

const getUserProfileByUsername = async (username: string) => {
  const user = await prisma.profile.findFirst({
    where: { user: { username } },
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
          username: true,
          Profile: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });
  return followers;
};

const followUser = async (followingId: number, userId: number) => {
  await prisma.userFollows.create({
    data: {
      followingId,
      followedById: userId,
    },
  });
};

const unfollowUser = async (followingId: number, userId: number) => {
  await prisma.userFollows.delete({
    where: {
      followingId_followedById: { followingId, followedById: userId },
    },
  });
};

const getUserFollowersByUsername = async (username: string) => {
  const followers = await prisma.userFollows.findMany({
    where: { following: { username } },
    include: {
      followedBy: {
        select: {
          id: true,
          username: true,
          Profile: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });
  return followers;
};

const getUserFollowings = async (page: number, limit: number, id: number) => {
  const followings = await prisma.userFollows.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { followedById: id },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          Profile: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });
  return followings;
};

const getUserByFollowingIdAndUserId = async (
  followingId: number,
  userId: number
) => {
  const user = await prisma.userFollows.findUnique({
    where: { followingId_followedById: { followingId, followedById: userId } },
  });
  return user || null;
};

const getUserFollowingsByUsername = async (username: string) => {
  const followings = await prisma.userFollows.findMany({
    where: { followedBy: { username } },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          Profile: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });
  return followings;
};

const getUserStatistics = async (page: number, limit: number, id: number) => {
  const follows = await prisma.userFollows.findMany({
    where: { followingId: id },
    select: { followedAt: true },
  });
  const posts = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { userId: id },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      PostView: { select: { viewedAt: true } },
      PostReaction: { select: { reactedAt: true } },
    },
  });

  return { follows, posts };
};

const getUserSavedPosts = async (page: number, limit: number, id: number) => {
  const savedPosts = await prisma.readingList.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { userId: id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImageUrl: true,
          createdAt: true,
          PostReaction: true,
          comments: true,
        },
      },
    },
  });
  return savedPosts;
};

const addToSavedPost = async (postId: number, userId: number) => {
  const savedPost = await prisma.readingList.create({
    data: {
      postId,
      userId,
    },
  });
  return savedPost;
};

const deleteSavedPost = async (postId: number, userId: number) => {
  const deletedPost = await prisma.readingList.delete({
    where: { postId_userId: { postId, userId } },
  });
  return deletedPost;
};

const getUserPosts = async (page: number, limit: number, userId: number) => {
  const posts = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { userId },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImageUrl: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          Profile: true,
        },
      },
      PostReaction: true,
      PostTopic: true,
      PostView: true,
      comments: true,
      publication: true,
    },
  });
  return posts;
};

const getUserPostsByUsername = async (username: string) => {
  const posts = await prisma.post.findMany({
    where: { user: { username } },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImageUrl: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          Profile: true,
        },
      },
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
    where: { title, userId },
    select: { id: true },
  });
  return post;
};

const getSavedPostByPostIdAndUserId = async (
  postId: number,
  userId: number
) => {
  const post = await prisma.readingList.findUnique({
    where: { postId_userId: { postId, userId } },
  });
  return post;
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
  getPostBySlug,
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
  addToSavedPost,
  deleteSavedPost,
  getUserFollowersByUsername,
  getUserFollowingsByUsername,
  getPostByTitleAndUserId,
  getUserPostsByUsername,
  getUserProfileByUsername,
  createUser,
  getCommentsByPostId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  reactPost,
  unreactPost,
  getReactionTypeById,
  isReacted,
  followUser,
  unfollowUser,
  getUserByFollowingIdAndUserId,
  getSavedPostByPostIdAndUserId,
};
