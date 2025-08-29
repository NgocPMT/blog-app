import { validationResult, type ValidationChain } from "express-validator";
import type { NextFunction, Request, Response } from "express";

const validate = (validation: ValidationChain[]) => [
  ...validation,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array().map((error) => error.msg) });
    }
    next();
  },
];

export default validate;
