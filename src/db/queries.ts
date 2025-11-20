import { PrismaClient, PostStatus, NotificationType } from "@prisma/client";
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
  publicationId?: number;
  coverImageUrl?: string;
  topicIds?: number[];
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

interface Notification {
  userId: number;
  actorId: number;
  type: NotificationType;
  postId?: number;
  publicationInvitationId?: number;
}

interface ReadingList {
  name: string;
  userId: number;
}

interface Publication {
  name: string;
  userId: number;
  bio?: string;
  avatarUrl?: string;
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
          FROM "postTopics" pt
          WHERE pt."postId" = p.id
        ), '[]'::json) as "postTopics",
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
        -- Calculate relevance score using TEXT fields only
        (
          similarity(p.title::text, ${searchQuery}) * 3 +
          similarity(u.username::text, ${searchQuery}) * 2
        ) as relevance_score
      FROM "Post" p
      INNER JOIN "User" u ON p."userId" = u.id
      WHERE 
        p.status = 'PUBLISHED' AND u."isActive" = true
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
      PostView: true,
      postTopics: true,
      comments: true,
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
          id: true,
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
      postTopics: true,
      comments: true,
    },
  });
  return post || null;
};

const createPost = async (post: Post) => {
  const {
    title,
    slug,
    content,
    userId,
    status,
    publicationId,
    coverImageUrl,
    topicIds,
  } = post;
  const createdPost = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      user: { connect: { id: userId } },
      status,
      coverImageUrl,
      ...(publicationId && {
        publication: { connect: { id: publicationId } },
      }),
    },
  });
  if (topicIds && topicIds.length > 0) {
    await prisma.postTopic.createMany({
      data: topicIds.map((topicId) => {
        return { postId: createdPost.id, topicId };
      }),
      skipDuplicates: true,
    });
  }

  return createdPost;
};

const reactPost = async (
  reactionTypeId: number,
  postId: number,
  userId: number
) => {
  const reaction = await prisma.postReaction.create({
    data: {
      postId,
      userId,
      reactionTypeId,
    },
    include: {
      reactionType: true,
    },
  });
  return reaction || null;
};

const unreactPost = async (postId: number, userId: number) => {
  const reaction = await prisma.postReaction.delete({
    where: { userId_postId: { postId, userId } },
  });
  return reaction || null;
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
  slug,
  coverImageUrl,
  topicsToAdd,
  topicsToRemove,
}: {
  id: number;
  title: string;
  content: string;
  slug: string;
  coverImageUrl: string;
  topicsToAdd?: number[];
  topicsToRemove?: number[];
}) => {
  const result = await prisma.$transaction(async (tx) => {
    const updatedPost = await tx.post.update({
      where: { id },
      data: {
        title,
        content,
        slug,
        coverImageUrl,
      },
    });

    if (topicsToRemove && topicsToRemove.length > 0) {
      await tx.postTopic.deleteMany({
        where: {
          postId: id,
          topicId: { in: topicsToRemove },
        },
      });
    }

    if (topicsToAdd && topicsToAdd.length > 0) {
      await tx.postTopic.createMany({
        data: topicsToAdd.map((topicId) => ({
          postId: id,
          topicId,
        })),
        skipDuplicates: true,
      });
    }

    return updatedPost;
  });

  return result;
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
      postTopics: true,
      PostView: true,
      comments: true,
    },
  });
  return post ?? null;
};

const getTopics = async () => {
  const topics = await prisma.topic.findMany({});
  return topics;
};

const createTopic = async ({ name }: { name: string }) => {
  const createdTopic = await prisma.topic.create({
    data: {
      name,
    },
  });
  return createdTopic;
};

const updateTopic = async ({ id, name }: { id: number; name: string }) => {
  const updatedTopic = await prisma.topic.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
  return updatedTopic;
};

const deleteTopic = async (id: number) => {
  const deletedTopic = await prisma.topic.delete({
    where: {
      id,
    },
  });
  return deletedTopic;
};

const getReactionTypes = async () => {
  const reactions = await prisma.reactionType.findMany();
  return reactions;
};

const getReactionTypeById = async (id: number) => {
  const reactionType = await prisma.reactionType.findUnique({ where: { id } });
  return reactionType || null;
};

const isReacted = async (postId: number, userId: number) => {
  const isReacted = await prisma.postReaction.findUnique({
    where: { userId_postId: { postId, userId } },
    include: { reactionType: true },
  });
  return isReacted;
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
    where: { userId: id, user: { isActive: true } },
  });
  return user ?? null;
};

const getUserProfileByUsername = async (username: string) => {
  const user = await prisma.profile.findFirst({
    where: { user: { username, isActive: true } },
    include: {
      user: { select: { id: true, username: true } },
    },
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
    take: 15,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          Profile: true,
          username: true,
          email: true,
          id: true,
        },
      },
    },
  });
  return notifications;
};

const markFirst15NotificationsAsRead = async (id: number) => {
  const first15 = await prisma.notification.findMany({
    take: 15,
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  await Promise.all(
    first15.map((notification) =>
      prisma.notification.update({
        where: { id: notification.id },
        data: { isRead: true },
      })
    )
  );
};

const createNotification = async (notification: Notification) => {
  const { userId, actorId, type } = notification;
  const actorProfile = await getUserProfile(actorId);
  let message;
  switch (type) {
    case "POST_REACTION": {
      message = `${actorProfile?.name} reacted on your post.`;
      break;
    }
    case "NEW_COMMENT": {
      message = `${actorProfile?.name} commented on your post.`;
      break;
    }
    case "NEW_POST": {
      message = `${actorProfile?.name} has created a new post.`;
      break;
    }
    case "PUBLICATION_INVITE": {
      message = `${actorProfile?.name} invite you to join their publication.`;
      break;
    }
    case "NEW_FOLLOW": {
      message = `${actorProfile?.name} just followed you.`;
      break;
    }
  }
  const createdNotification = await prisma.notification.create({
    data: {
      userId,
      actorId,
      message,
      type,
    },
  });
  return createdNotification;
};

const getUserFollowers = async (id: number, page?: number, limit?: number) => {
  const skip = page && limit ? (page - 1) * limit : 0;
  const take = limit || undefined;

  const followers = await prisma.userFollows.findMany({
    skip,
    take,
    where: { followingId: id, followedBy: { isActive: true } },
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
    where: { following: { username }, followedBy: { isActive: true } },
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

const createPostView = async ({
  slug,
  userId,
}: {
  slug: string;
  userId: number;
}) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
    },
  });

  if (!post) return null;

  const postView = await prisma.postView.create({
    data: {
      postId: post.id,
      userId,
    },
  });
  return postView;
};

const isViewed = async ({ slug, userId }: { slug: string; userId: number }) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
    },
  });

  if (!post) return false;

  const postView = await prisma.postView.findUnique({
    where: {
      postId_userId: { postId: post.id, userId },
    },
  });
  return !!postView;
};

const getUserFollowings = async (id: number, page?: number, limit?: number) => {
  const skip = page && limit ? (page - 1) * limit : 0;
  const take = limit || undefined;
  const followings = await prisma.userFollows.findMany({
    skip,
    take,
    where: { followedById: id, following: { isActive: true } },
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

const getUserByPostId = async (id: number) => {
  const user = await prisma.post.findUnique({
    where: { id },
    select: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          Profile: true,
        },
      },
    },
  });
  return user;
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
    where: { followedBy: { username }, following: { isActive: true } },
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

const getReadingListSavedPosts = async (
  id: number,
  page?: number,
  limit?: number
) => {
  const skip = page && limit ? (page - 1) * limit : 0;
  const take = limit || undefined;
  const savedPosts = await prisma.savedPost.findMany({
    skip,
    take,
    where: { readingListId: id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          content: true,
          slug: true,
          coverImageUrl: true,
          createdAt: true,
          PostReaction: true,
          postTopics: true,
          comments: true,
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              Profile: true,
            },
          },
        },
      },
    },
  });
  return savedPosts;
};

const getUsersReadingList = async (userId: number) => {
  const readingLists = await prisma.readingList.findMany({
    where: { userId },
  });
  return readingLists;
};

const createReadingList = async (readingList: ReadingList) => {
  const { name, userId } = readingList;
  const createdReadingList = await prisma.readingList.create({
    data: {
      name,
      userId,
    },
  });
  return createdReadingList;
};

const updateReadingList = async ({
  id,
  name,
}: {
  id: number;
  name: string;
}) => {
  const updatedReadingList = await prisma.readingList.update({
    where: { id },
    data: {
      name,
    },
  });
  return updatedReadingList;
};

const deleteReadingList = async (id: number) => {
  const deletedReadingList = await prisma.readingList.delete({
    where: { id },
  });
  return deletedReadingList;
};

const createSavedPost = async (postId: number, readingListId: number) => {
  const savedPost = await prisma.savedPost.create({
    data: {
      postId,
      readingListId,
    },
  });
  return savedPost;
};

const deleteSavedPost = async (id: number) => {
  const deletedPost = await prisma.savedPost.delete({
    where: { id },
  });
  return deletedPost;
};

const getUserPublishedPosts = async (
  page: number,
  limit: number,
  userId: number
) => {
  const posts = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
    where: { userId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
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
      PostView: true,
      postTopics: true,
      comments: true,
    },
  });
  return posts;
};

const getUserDraftPosts = async (
  page: number,
  limit: number,
  userId: number
) => {
  const posts = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
    where: { userId, status: "DRAFT" },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
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
      PostView: true,
      postTopics: true,
      comments: true,
    },
  });
  return posts;
};

const getUserPosts = async (page: number, limit: number, userId: number) => {
  const posts = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { userId, user: { isActive: true } },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
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
      postTopics: true,
      PostView: true,
      comments: true,
    },
  });
  return posts;
};

const getUserPostsByUsername = async (
  page: number,
  limit: number,
  username: string
) => {
  const posts = await prisma.post.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where: { user: { username, isActive: true } },
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
      postTopics: true,
      PostView: true,
      comments: true,
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

const getSavedPostByPostIdAndReadingListId = async (
  postId: number,
  readingListId: number
) => {
  const post = await prisma.savedPost.findUnique({
    where: { postId_readingListId: { postId, readingListId } },
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
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          Profile: true,
        },
      },
    },
  });
  return comments;
};

const getCommentById = async (id: number) => {
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          Profile: true,
        },
      },
    },
  });
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

const getReportedPosts = async (
  page?: number,
  limit?: number,
  titleSearchQuery?: string,
  userSearchQuery?: string
) => {
  const skip = page && limit ? (page - 1) * limit : 0;
  const take = limit || undefined;

  const reportedPosts = await prisma.reportedPosts.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
    where: {
      post: {
        title: titleSearchQuery
          ? {
              contains: titleSearchQuery,
              mode: "insensitive",
            }
          : undefined,
        user: {
          username: userSearchQuery
            ? {
                contains: userSearchQuery,
                mode: "insensitive",
              }
            : undefined,
        },
      },
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImageUrl: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
  return reportedPosts;
};

const getUsers = async (
  page?: number,
  limit?: number,
  searchQuery?: string
) => {
  const skip = page && limit ? (page - 1) * limit : 0;
  const take = limit || undefined;

  const users = await prisma.user.findMany({
    skip,
    take,
    where: {
      role: "USER",
      username: searchQuery
        ? {
            contains: searchQuery,
            mode: "insensitive",
          }
        : undefined,
    },
    omit: { password: true },
  });

  return users;
};

const deactivateUser = async (id: number) => {
  await prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
};

const activateUser = async (id: number) => {
  await prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive: true,
    },
  });
};

const createReportedPost = async ({
  postId,
  userId,
}: {
  postId: number;
  userId: number;
}) => {
  const createdReportedPost = await prisma.reportedPosts.create({
    data: {
      postId,
      userId,
    },
  });
  return createdReportedPost || null;
};

const getReportedPostByPostIdAndUserId = async ({
  postId,
  userId,
}: {
  postId: number;
  userId: number;
}) => {
  const reportedPost = await prisma.reportedPosts.findUnique({
    where: {
      postId_userId: { postId, userId },
    },
  });
  return reportedPost || null;
};

const deleteReportedPost = async ({
  postId,
  userId,
}: {
  postId: number;
  userId: number;
}) => {
  const deletedReportedPost = await prisma.reportedPosts.delete({
    where: { postId_userId: { postId, userId } },
  });
  return deletedReportedPost || null;
};

const publishPost = async (slug: string) => {
  const publishedPost = await prisma.post.update({
    where: { slug },
    data: {
      status: "PUBLISHED",
    },
  });
  return publishedPost;
};

const createPublication = async (publication: Publication) => {
  const { name, bio, avatarUrl, userId } = publication;

  const createdPublication = await prisma.publication.create({
    data: {
      name,
      bio,
      avatarUrl,
    },
  });

  await prisma.publicationToUser.create({
    data: {
      publicationId: createdPublication.id,
      userId,
      isOwner: true,
    },
  });

  return createdPublication;
};

const getPublications = async (
  page?: number,
  limit?: number,
  searchQuery?: string
) => {
  const skip = page && limit ? (page - 1) * limit : 0;
  const take = limit || undefined;
  const publications = await prisma.publication.findMany({
    skip,
    take,
    where: {
      name: searchQuery
        ? {
            contains: searchQuery,
            mode: "insensitive",
          }
        : undefined,
    },
  });
  return publications;
};

const getPublicationPosts = async (
  publicationId: number,
  page?: number,
  limit?: number,
  searchQuery?: string
) => {
  const skip = page && limit ? (page - 1) * limit : 0;
  const take = limit || undefined;
  const publicationPosts = await prisma.post.findMany({
    skip,
    take,
    where: {
      publicationId,
      title: searchQuery
        ? {
            contains: searchQuery,
            mode: "insensitive",
          }
        : undefined,
    },
  });
  return publicationPosts;
};

const updatePublication = async ({
  id,
  name,
  bio,
  avatarUrl,
}: {
  id: number;
  name: string;
  bio: string;
  avatarUrl: string;
}) => {
  const updatedPublication = await prisma.publication.update({
    where: {
      id,
    },
    data: {
      name,
      bio,
      avatarUrl,
    },
  });

  return updatedPublication;
};

const deletePublication = async (id: number) => {
  const deletedPublication = await prisma.publication.delete({
    where: {
      id,
    },
  });

  return deletedPublication;
};

export default {
  getPublishedPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
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
  getUsersReadingList,
  createReadingList,
  updateReadingList,
  deleteReadingList,
  getReadingListSavedPosts,
  createSavedPost,
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
  getSavedPostByPostIdAndReadingListId,
  getReactionTypes,
  createNotification,
  getUserByPostId,
  createPostView,
  isViewed,
  getReportedPosts,
  createReportedPost,
  deleteReportedPost,
  getUsers,
  markFirst15NotificationsAsRead,
  getUserDraftPosts,
  getUserPublishedPosts,
  deactivateUser,
  activateUser,
  getReportedPostByPostIdAndUserId,
  publishPost,
  createPublication,
  getPublications,
  getPublicationPosts,
  updatePublication,
  deletePublication,
};
