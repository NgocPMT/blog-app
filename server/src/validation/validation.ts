import { body, param, type ValidationChain } from "express-validator";
import type { Request } from "express";
import db from "../db/queries.js";

const emptyErr = "must not be empty!";

const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage(`Username ${emptyErr}`)
    .isLength({ min: 3, max: 255 })
    .withMessage("Username must be from 3 to 255 characters!")
    .custom(async (username) => {
      const user = await db.getUserByUsername(username);
      if (user) throw new Error("Username already exists");
    }),
  body("email")
    .trim()
    .notEmpty()
    .withMessage(`Email ${emptyErr}`)
    .isEmail()
    .withMessage("You must enter a valid email!")
    .custom(async (email) => {
      const user = await db.getUserByEmail(email);
      if (user) throw new Error("Email already exists");
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
      const userId = (req.user as { id: number }).id;
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
    .custom(async (commentId: string) => {
      const comment = await db.getCommentById(parseInt(commentId));
      if (!comment) throw new Error("Comment doesn't exist");
    }),
];

const postParamValidation: ValidationChain[] = [
  param("postId")
    .isInt()
    .withMessage("Post ID must be an integer!")
    .custom(async (postId: string) => {
      const post = await db.getPostById(parseInt(postId));
      if (!post) throw new Error("Post doesn't exist");
    }),
];

export {
  registerValidation,
  loginValidation,
  postValidation,
  commentValidation,
  commentParamValidation,
  postParamValidation,
};

export default {
  registerValidation,
  loginValidation,
  postValidation,
  commentValidation,
  commentParamValidation,
  postParamValidation,
};
