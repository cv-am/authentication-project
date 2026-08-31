import { body } from "express-validator";

export const registerValidation = [
    body("firstName")
    .trim()
    .notEmpty().withMessage("First name is required")
    .isLength({min:3, max:100}),

    body("lastName")
    .trim()
    .notEmpty().withMessage("Last name is required")
    .isLength({min:3, max:100}),

    body("email")
    .trim()
    .normalizeEmail()
    .isEmail().withMessage("Invalid email address"),

    body("password")
    .isLength({min:8})
    .withMessage("Password must be at least 8 characters long")
]


export const verifyEmailValidation = [
    body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

    body("otp")
    .trim()
    .isLength({min:6, max:6})
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers")
]

export const resendOtpValidation = [
    body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
]