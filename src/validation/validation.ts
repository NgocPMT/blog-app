import { body, param, query, type ValidationChain } from "express-validator";
import db from "../db/queries.js";

const emptyErr = "must not be empty!";

const registerValidation: ValidationChain[] = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage(`Username ${emptyErr}`)
    .bail()
    .isLength({ min: 3, max: 255 })
    .withMessage("Username must be from 3 to 255 characters!")
    .bail()
    .custom(async (username) => {
      const user = await db.getUserByUsername(username);
      if (user) throw new Error("Username already exists");
    }),
  body("email")
    .trim()
    .notEmpty()
    .withMessage(`Email ${emptyErr}`)
    .bail()
    .isEmail()
    .withMessage("You must enter a valid email!")
    .bail()
    .custom(async (email) => {
      const user = await db.getUserByEmail(email);
      if (user) throw new Error("Email already exists");
    }),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`Password ${emptyErr}`)
    .bail()
    .isLength({ min: 6, max: 255 })
    .withMessage("Password must be from 6 to 255 characters!"),
  body("passwordConfirmation")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Password confirmation must match the password"),
];

const loginValidation: ValidationChain[] = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage(`Username ${emptyErr}`)
    .bail()
    .custom(async (username) => {
      const user = await db.getUserByUsername(username);
      if (!user) throw new Error("Username or password is incorrect");
      if (!user.isActive) throw new Error("this account have been banned");
    }),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`Username or password ${emptyErr}`),
];

const postValidation: ValidationChain[] = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage(`Post title ${emptyErr}`)
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Post title must be from 2 to 255 characters!")
    .bail()
    .custom(async (title, { req }) => {
      const userId = (req.user as { id: number }).id;
      const post = await db.getPostByTitleAndUserId(title, userId);
      if (post)
        throw new Error("Post with this title already exists on this user");
    }),
  body("content").trim().notEmpty().withMessage(`Post content ${emptyErr}`),
];

const postSavingValidation: ValidationChain[] = [
  body("id")
    .optional()
    .isInt()
    .bail()
    .custom(async (postId: string) => {
      const post = await db.getPostById(parseInt(postId));
      if (!post) throw new Error("Post doesn't exist");
    }),
];

const postUpdateValidation: ValidationChain[] = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage(`Post title ${emptyErr}`)
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Post title must be from 2 to 255 characters!")
    .bail(),
  body("content").trim().notEmpty().withMessage(`Post content ${emptyErr}`),
];

const profileValidation: ValidationChain[] = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(`Name ${emptyErr}`)
    .bail()
    .isLength({ min: 1, max: 50 })
    .withMessage("Name must be from 1 to 50 characters!"),
  body("bio")
    .trim()
    .isLength({ max: 160 })
    .withMessage("Name must be under 160 characters!"),
];

const reactionIdValidation: ValidationChain[] = [
  body("reactionTypeId")
    .isInt()
    .withMessage("Reaction ID must be an integer!")
    .bail()
    .toInt()
    .custom((reactionTypeId, { req }) => {
      if (typeof reactionTypeId !== "number") {
        throw new Error("Reaction ID must be a number, not a string!");
      }
      return true;
    })
    .bail()
    .custom(async (reactionTypeId: string) => {
      const reactionType = await db.getReactionTypeById(
        parseInt(reactionTypeId)
      );
      if (!reactionType) throw new Error("Reaction doesn't exist");
    }),
];

const reactionIdParamValidation: ValidationChain[] = [
  param("reactionId")
    .isInt()
    .withMessage("Reaction ID must be an integer!")
    .bail()
    .toInt()
    .custom((reactionTypeId, { req }) => {
      if (typeof reactionTypeId !== "number") {
        throw new Error("Reaction ID must be a number, not a string!");
      }
      return true;
    })
    .bail()
    .custom(async (reactionTypeId: string) => {
      const reactionType = await db.getReactionTypeById(
        parseInt(reactionTypeId)
      );
      if (!reactionType) throw new Error("Reaction doesn't exist");
    }),
];

const reactionValidation: ValidationChain[] = [
  body("name").trim().notEmpty().withMessage(`Name ${emptyErr}`),
  body("reactionImageUrl")
    .trim()
    .notEmpty()
    .withMessage(`Reaction ${emptyErr}`),
];

const commentValidation: ValidationChain[] = [
  body("content").trim().notEmpty().withMessage(`Comment ${emptyErr}`),
];

const reportedPostValidation: ValidationChain[] = [
  body("postId")
    .isInt()
    .withMessage("Post ID must be an integer!")
    .bail()
    .custom(async (postId: string) => {
      const post = await db.getPostById(parseInt(postId));
      if (!post) throw new Error("Post doesn't exist");
    }),
  body("userId")
    .isInt()
    .withMessage("User ID must be an integer!")
    .bail()
    .custom(async (userId: string) => {
      const user = await db.getUserById(parseInt(userId));
      if (!user) throw new Error("User doesn't exist");
    }),
];

const commentParamValidation: ValidationChain[] = [
  param("commentId")
    .isInt()
    .withMessage("Comment ID must be an integer!")
    .bail()
    .custom(async (commentId: string) => {
      const comment = await db.getCommentById(parseInt(commentId));
      if (!comment) throw new Error("Comment doesn't exist");
    }),
];

const postParamValidation: ValidationChain[] = [
  param("postId")
    .isInt()
    .withMessage("Post ID must be an integer!")
    .bail()
    .custom(async (postId: string) => {
      const post = await db.getPostById(parseInt(postId));
      if (!post) throw new Error("Post doesn't exist");
    }),
];

const postIdValidation: ValidationChain[] = [
  body("postId")
    .isInt()
    .withMessage("Post ID must be an integer!")
    .bail()
    .custom(async (postId: string) => {
      const post = await db.getPostById(parseInt(postId));
      if (!post) throw new Error("Post doesn't exist");
    }),
];

const followingIdValidation: ValidationChain[] = [
  body("followingId")
    .isInt()
    .withMessage("User ID must be an integer!")
    .bail()
    .custom(async (followingId: string) => {
      const user = await db.getUserById(parseInt(followingId));
      if (!user) throw new Error("User doesn't exist");
    }),
];

const followingIdParamValidation: ValidationChain[] = [
  param("followingId")
    .isInt()
    .withMessage("User ID must be an integer!")
    .bail()
    .custom(async (followingId: string) => {
      const user = await db.getUserById(parseInt(followingId));
      if (!user) throw new Error("User doesn't exist");
    }),
];

const slugParamValidation: ValidationChain[] = [
  param("slug")
    .notEmpty()
    .withMessage("Slug must not be empty")
    .bail()
    .custom(async (slug: string) => {
      const post = await db.getPostBySlug(slug);
      if (!post) throw new Error("Post doesn't exist");
    }),
];

const userIdParamValidation: ValidationChain[] = [
  param("userId")
    .isInt()
    .withMessage("User ID must be an integer")
    .bail()
    .custom(async (userId: string) => {
      const user = await db.getUserById(parseInt(userId));
      if (!user) throw new Error("User doesn't exist");
    }),
];

const usernameParamValidation: ValidationChain[] = [
  param("username")
    .notEmpty()
    .withMessage("Username must not be empty")
    .bail()
    .custom(async (username: string) => {
      const user = await db.getUserByUsername(username);
      if (!user) throw new Error("User doesn't exist");
    }),
];

const postQueryValidation: ValidationChain[] = [
  query("page")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Page index must be an integer"),

  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Pagination limit must be an integer"),

  query("search")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Search query must be under 255 characters"),
];

export {
  registerValidation,
  loginValidation,
  postValidation,
  postQueryValidation,
  commentValidation,
  commentParamValidation,
  postParamValidation,
  userIdParamValidation,
  usernameParamValidation,
  profileValidation,
  reactionIdValidation,
  reactionIdParamValidation,
  reactionValidation,
  postIdValidation,
  followingIdValidation,
  followingIdParamValidation,
  slugParamValidation,
  postUpdateValidation,
  postSavingValidation,
  reportedPostValidation,
};

export default {
  registerValidation,
  loginValidation,
  postValidation,
  commentValidation,
  commentParamValidation,
  postParamValidation,
  postIdValidation,
  profileValidation,
  reactionIdValidation,
  reactionIdParamValidation,
  reactionValidation,
  followingIdValidation,
  followingIdParamValidation,
  slugParamValidation,
  postUpdateValidation,
  postSavingValidation,
  reportedPostValidation,
};
