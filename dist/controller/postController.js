import passport from "passport";
import db from "../db/queries.js";
import { postValidation, postParamValidation, postQueryValidation, } from "../validation/validation.js";
import { validatePostAuthorization } from "../middlewares/validateAuthorization.js";
import validate from "../middlewares/validate.js";
const handleGetPostById = [
    ...validate(postParamValidation),
    async (req, res) => {
        const id = parseInt(req.params.postId);
        const post = await db.getPostById(id);
        res.json(post);
    },
];
const handleGetPostsPagination = [
    ...validate(postQueryValidation),
    async (req, res) => {
        const { page, limit, search } = req.query;
        const isEmptySearch = search ? search.trim() === "" : true;
        const posts = await db.getPublishedPosts(parseInt(page), parseInt(limit), isEmptySearch ? null : search);
        res.json(posts);
    },
];
const handleUpdatePost = [
    passport.authenticate("jwt", { session: false }),
    validatePostAuthorization,
    ...validate(postParamValidation),
    ...validate(postValidation),
    async (req, res) => {
        const id = parseInt(req.params.postId);
        const { title, content } = req.body;
        await db.updatePost({ id, title, content });
        return res.json({ message: "Update successfully" });
    },
];
const handleDeletePost = [
    passport.authenticate("jwt", { session: false }),
    validatePostAuthorization,
    ...validate(postParamValidation),
    async (req, res) => {
        const id = parseInt(req.params.postId);
        await db.deletePost(id);
        res.json({ message: "Delete successfully" });
    },
];
const handleCreatePost = [
    passport.authenticate("jwt", { session: false }),
    ...validate(postValidation),
    async (req, res) => {
        const { title, content } = req.body;
        const userId = req.user.id;
        await db.createPost({ title, content, userId });
        res.status(201).json({ message: "Create post successfully" });
    },
];
const handlePublishPost = [
    passport.authenticate("jwt", { session: false }),
    validatePostAuthorization,
    ...validate(postParamValidation),
    async (req, res) => {
        const postId = parseInt(req.params.postId);
        const post = await db.updatePostPublished(postId, true);
        res.status(201).json({ message: "Publish successfully", post });
    },
];
const handleUnpublishPost = [
    passport.authenticate("jwt", { session: false }),
    validatePostAuthorization,
    ...validate(postParamValidation),
    async (req, res) => {
        const postId = parseInt(req.params.postId);
        const post = await db.updatePostPublished(postId, false);
        res.status(201).json({ message: "Unpublish successfully", post });
    },
];
export default {
    handleGetPostById,
    handleUpdatePost,
    handleDeletePost,
    handleCreatePost,
    handlePublishPost,
    handleUnpublishPost,
    handleGetPostsPagination,
};
