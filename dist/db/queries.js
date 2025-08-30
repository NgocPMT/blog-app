import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const getPublishedPosts = async (page, limit, searchQuery) => {
    const posts = await prisma.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
            published: true,
            title: searchQuery ? { contains: searchQuery, mode: "insensitive" } : {},
        },
    });
    return posts;
};
// For validate post model's unique fields
const getPostByTitleAndUserId = async (title, userId) => {
    const post = await prisma.post.findFirst({
        where: { title: { equals: title, mode: "insensitive" }, userId },
    });
    return post ?? null;
};
const createPost = async (post) => {
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
const updatePostPublished = async (id, published) => {
    const post = await prisma.post.update({ where: { id }, data: { published } });
    return post;
};
const updatePost = async ({ id, title, content, }) => {
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
const deletePost = async (id) => {
    const post = await prisma.post.delete({ where: { id } });
    return post;
};
const getPostById = async (id) => {
    const post = await prisma.post.findUnique({ where: { id } });
    return post ?? null;
};
const getUserById = async (id) => {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ?? null;
};
const getUserByUsername = async (username) => {
    const user = await prisma.user.findUnique({ where: { username } });
    return user ?? null;
};
const getUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ?? null;
};
const getUserInformation = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: { username: true, email: true },
    });
    return user ?? null;
};
const getUserPosts = async (userId) => {
    const posts = await prisma.post.findMany({ where: { userId } });
    return posts;
};
const createUser = async (user) => {
    const { username, email, password } = user;
    await prisma.user.create({
        data: {
            username,
            email,
            password,
        },
    });
};
const getCommentsByPostId = async (postId) => {
    const comments = await prisma.comment.findMany({
        where: { postId },
    });
    return comments;
};
const getCommentById = async (id) => {
    const comment = await prisma.comment.findUnique({ where: { id } });
    return comment ?? null;
};
const createComment = async (comment) => {
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
const updateComment = async ({ id, content, }) => {
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
const deleteComment = async (id) => {
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
    updatePostPublished,
    getUserById,
    getUserInformation,
    getUserByUsername,
    getUserByEmail,
    getUserPosts,
    createUser,
    getCommentsByPostId,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
};
