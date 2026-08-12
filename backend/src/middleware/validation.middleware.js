import { body, validationResult } from "express-validator";

export const userRegistrationRules = [

    body("name").notEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters long")
    .matches(/^[a-zA-Z\s]+$/).withMessage("Name can only contain letters and spaces"),

    body("username").notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 20 }).withMessage("Username must be between 3 and 20 characters long")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

    body("email").isEmail().withMessage("Invalid email address"),

    body("password")
    .isLength({ min: 8, max: 20 }).withMessage("Password must be at least 8 characters long")
];

export const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const userLoginRules = [
    body("username").notEmpty().withMessage("Username or Email is required"),
    body("password").notEmpty().withMessage("Password is required")
];