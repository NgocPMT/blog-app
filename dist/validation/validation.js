import { body, param, query } from "express-validator";
import db from "../db/queries.js";
const emptyErr = "must not be empty!";
const registerValidation = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage(`Username ${emptyErr}`)
        .isLength({ min: 3, max: 255 })
        .withMessage("Username must be from 3 to 255 characters!")
        .bail()
        .custom(async (username) => {
        const user = await db.getUserByUsername(username);
        if (user)
            throw new Error("Username already exists");
    }),
    body("email")
        .trim()
        .notEmpty()
        .withMessage(`Email ${emptyErr}`)
        .isEmail()
        .withMessage("You must enter a valid email!")
        .bail()
        .custom(async (email) => {
        const user = await db.getUserByEmail(email);
        if (user)
            throw new Error("Email already exists");
    }),
    body("password")
        .trim()
        .notEmpty()
        .withMessage(`Password ${emptyErr}`)
        .isLength({ min: 6, max: 255 })
        .withMessage("Password must be from 6 to 255 characters!"),
    body("passwordConfirmation")
        .custom((value, { req }) => {
        return value === req.body.password;
    })
        .withMessage("Password confirmation must match the password"),
];
const loginValidation = [
    body("username").trim().notEmpty().withMessage(`Username ${emptyErr}`),
    body("password").trim().notEmpty().withMessage(`Password ${emptyErr}`),
];
const postValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage(`Post title ${emptyErr}`)
        .isLength({ min: 2, max: 255 })
        .withMessage("Post title must be from 2 to 255 characters!")
        .custom(async (title, { req }) => {
        const userId = req.user.id;
        const post = await db.getPostByTitleAndUserId(title, userId);
        if (post)
            throw new Error("Post with this title already exists on this user");
    }),
    body("content").trim().notEmpty().withMessage(`Post content ${emptyErr}`),
];
const commentValidation = [
    body("content").trim().notEmpty().withMessage(`Comment ${emptyErr}`),
];
const commentParamValidation = [
    param("commentId")
        .isInt()
        .withMessage("Comment ID must be an integer!")
        .bail()
        .custom(async (commentId) => {
        const comment = await db.getCommentById(parseInt(commentId));
        if (!comment)
            throw new Error("Comment doesn't exist");
    }),
];
const postParamValidation = [
    param("postId")
        .isInt()
        .withMessage("Post ID must be an integer!")
        .bail()
        .custom(async (postId) => {
        const post = await db.getPostById(parseInt(postId));
        if (!post)
            throw new Error("Post doesn't exist");
    }),
];
const userParamValidation = [
    param("userId")
        .isInt()
        .withMessage("User ID must be an integer")
        .bail()
        .custom(async (userId) => {
        const user = await db.getUserById(parseInt(userId));
        if (!user)
            throw new Error("User doesn't exist");
    }),
];
const postQueryValidation = [
    query("page").isInt().withMessage("Page index must be an integer"),
    query("limit").isInt().withMessage("Pagination must be an integer"),
    query("search")
        .isLength({ max: 255 })
        .withMessage("Search query must be under 255 characters"),
];
export { registerValidation, loginValidation, postValidation, postQueryValidation, commentValidation, commentParamValidation, postParamValidation, userParamValidation, };
export default {
    registerValidation,
    loginValidation,
    postValidation,
    commentValidation,
    commentParamValidation,
    postParamValidation,
};
