import { body } from "express-validator";

const emptyErr = "must not be empty!";

const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage(`Username ${emptyErr}`)
    .isLength({ min: 3, max: 255 })
    .withMessage("Username must be from 3 to 255 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage(`Email ${emptyErr}`)
    .isEmail()
    .withMessage("You must enter a valid email (example@mail.com)"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage(`Password ${emptyErr}`)
    .isLength({ min: 6, max: 255 })
    .withMessage("Password must be from 6 to 255 characters"),
];

const loginValidation = [
  body("username").trim().notEmpty().withMessage(`Username ${emptyErr}`),
  body("password").trim().notEmpty().withMessage(`Password ${emptyErr}`),
];

export default { registerValidation, loginValidation };
