import express from "express"
import * as authController from "./controller.js"
import { resendOtpLimiter } from "../../middleware/rate-limit.middleware.js"
import * as authValidation from "../../validation/auth.validation.js"
import validate from "../../middleware/validate.middleware.js"


const router = express.Router()

router.post(
    "/register",
    authValidation.registerValidation,
    validate,
    authController.register
);

router.post(
    "/verify-email",
    authValidation.verifyEmailValidation,
    validate,
    authController.verifyEmail
)

router.post(
    "/resend-otp",
    resendOtpLimiter,
    authValidation.resendOtpValidation,
    validate,
    authController.resendOtp
)

export default router