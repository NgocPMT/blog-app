import db from "../db/queries.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import validation from "../validation/validation.js";
const handleRegister = [
    ...validation.registerValidation,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res
                .status(400)
                .json({ errors: errors.array().map((error) => error.msg) });
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.createUser({ username, email, password: hashedPassword });
        res.status(201).json({ message: "Register successfully." });
    },
];
const handleLogin = [
    ...validation.loginValidation,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res
                .status(400)
                .json({ errors: errors.array().map((error) => error.msg) });
        passport.authenticate("local", { session: false }, async (err, user, info) => {
            if (err || !user)
                return res
                    .status(400)
                    .json({ message: info?.message ?? "Something is not right", user });
            req.login(user, { session: false }, (loginErr) => {
                if (loginErr)
                    return res.status(500).json({ message: loginErr.message });
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "8h" });
                return res.json({ user, token });
            });
        })(req, res);
    },
];
export default { handleRegister, handleLogin };
