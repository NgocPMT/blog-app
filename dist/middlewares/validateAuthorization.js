import db from "../db/queries.js";
const validateAuthorization = async (req, res, next) => {
    const userId = parseInt(req.params.userId);
    const currentUserId = req.user.id;
    if (userId !== currentUserId)
        return res.status(403).json({ error: "Forbidden" });
    next();
};
const validatePostAuthorization = async (req, res, next) => {
    const id = parseInt(req.params.postId);
    const post = await db.getPostById(id);
    if (!post)
        return res.status(404).json({ error: "Post not found" });
    const userId = req.user.id;
    if (post.userId !== userId)
        return res.status(403).json({ error: "Forbidden" });
    next();
};
const validateCommentAuthorization = async (req, res, next) => {
    const { postId, commentId } = req.params;
    const comment = await db.getCommentById(parseInt(commentId));
    if (!comment)
        return res.status(404).json({ error: "Comment not found" });
    const post = await db.getPostById(parseInt(postId));
    if (!post)
        return res.status(404).json({ error: "Post not found" });
    const userId = req.user.id;
    if (comment.userId !== userId && post.userId !== userId)
        return res.status(403).json({ error: "Forbidden" });
    next();
};
export { validatePostAuthorization, validateCommentAuthorization, validateAuthorization, };
export default {
    validatePostAuthorization,
    validateCommentAuthorization,
    validateAuthorization,
};
