import type { Request, Response } from "express";
import db from "../db/queries.js";
import passport from "passport";

const handleGetReactions = [
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response) => {
    const reactions = await db.getReactionTypes();

    return res.json({ reactions });
  },
];

export default { handleGetReactions };
