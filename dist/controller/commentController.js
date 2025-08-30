import passport from "passport";
import db from "../db/queries.js";
import { commentParamValidation, commentValidation, } from "../validation/validation.js";
import validate from "../middlewares/validate.js";
import { validateCommentAuthorization } from "../middlewares/validateAuthorization.js";
const handleGetCommentsByPostId = async (req, res) => {
    const postId = req.params.postId;
    const comments = await db.getCommentsByPostId(parseInt(postId));
    res.json(comments);
};
const handleCreateComment = [
    passport.authenticate("jwt", { session: false }),
    ...validate(commentValidation),
    async (req, res) => {
        const { content } = req.body;
        const { postId } = req.params;
        const userId = req.user.id;
        const comment = await db.createComment({
            content,
            userId,
            postId: parseInt(postId),
        });
        res.status(201).json({ message: "Create successfully", comment });
    },
];
const handleUpdateComment = [
    passport.authenticate("jwt", { session: false }),
    validateCommentAuthorization,
    ...validate(commentParamValidation),
    ...validate(commentValidation),
    async (req, res) => {
        const { content } = req.body;
        const { commentId } = req.params;
        const comment = await db.updateComment({
            id: parseInt(commentId),
            content,
        });
        res.json({ message: "Update successfully", comment });
    },
];
const handleDeleteComment = [
    passport.authenticate("jwt", { session: false }),
    validateCommentAuthorization,
    ...validate(commentParamValidation),
    async (req, res) => {
        const { commentId } = req.params;
        const comment = await db.deleteComment(parseInt(commentId));
        res.json({ message: "Delete successfully", comment });
    },
];
export default {
    handleGetCommentsByPostId,
    handleCreateComment,
    handleUpdateComment,
    handleDeleteComment,
};
