import passport from "passport";
import db from "../db/queries.js";
import { userParamValidation } from "../validation/validation.js";
import validate from "../middlewares/validate.js";
import { validateAuthorization } from "../middlewares/validateAuthorization.js";
const handleGetUserProfile = [
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const userId = req.user.id;
        const user = await db.getUserInformation(userId);
        return res.json(user);
    },
];
const handleGetUserPosts = [
    passport.authenticate("jwt", { session: false }),
    validateAuthorization,
    ...validate(userParamValidation),
    async (req, res) => {
        const userId = parseInt(req.params.userId);
        const posts = await db.getUserPosts(userId);
        return res.json(posts);
    },
];
export default { handleGetUserProfile, handleGetUserPosts };
