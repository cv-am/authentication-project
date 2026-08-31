import * as authQueries from "./query.js"
import { config } from "../../config/env.js"
import { hashPassword } from "../../utils/password.js"
import * as otpService from "../../utils/otp.js"
import runInTransaction from "../../utils/transaction.js"
import { sendEmail } from "../email/service.js"
import { otpEmailTemplate, welcomeEmailTemplate } from "../email/templates.js"
import ApiError from "../../utils/api-error.js"

export const registerUser = async ({ firstName, lastName, email, password }) => {
    const existingUser = await authQueries.findUserByEmail(email);

    if (existingUser) {
        throw new ApiError(
            409,
            "USER_ALREADY_EXISTS",
            "An account with this email already exists"
        );
    }

    const hashedPassword = await hashPassword(password);

    const otp = otpService.generateOtp()
    const otpHash = await otpService.hashOtp(otp)

    const expiresAt = otpService.getOtpExpiration()

    const userId = await runInTransaction(async(connection) => {
        const userId = await authQueries.createUser(
            {
                firstName,
                lastName,
                email,
                hashedPassword
            },
            connection
        )

        await authQueries.createOtp(
            {
                userId,
                otpHash,
                purpose: "email_verification",
                expiresAt
            },
            connection
        );

        return userId;
    })


    const htmlContent = otpEmailTemplate({
        firstName,
        otp
    })

    await sendEmail({
        to: email,
        subject: "Verify your email",
        html: htmlContent
    })

    return {
        userId,
        email,
        message: "Registration successful. Please verify your email."
    };
};

export const verifyEmail = async ({ email, otp}) => {
    const user = await authQueries.findUserByEmail(email)

    if(!user) {
        throw new ApiError(
            404,
            "USER_NOT_FOUND",
            "User not found"
        )
    }

    if(user.is_email_verified){
        throw new ApiError(
            409,
            "EMAIL_ALREADY_VERIFIED",
            "Email is already verified"
        )
    }

    const otpRecord = await authQueries.findActiveOtp({
        userId: user.id,
        purpose: "email_verification"
    })

    if(!otpRecord) {
        throw new ApiError(
            400,
            "OTP_NOT_FOUND",
            "No active verification OTP found"
        )
    }

    if(new Date(otpRecord.expires_at) < new Date()) {
        throw new ApiError(
            400,
            "OTP_EXPIRED",
            "OTP has expired"
        )
    }

    if(otpRecord.attempts >= config.otp.maxAttempts) {
        throw new ApiError(
            429,
            "OTP_ATTEMPTS_EXCEEDED",
            "Too many incorrect OTP attempts"
        )
    }

    const isValidOtp = await otpService.verifyOtp(otp, otpRecord.otp_hash)

    if(!isValidOtp) {
        await authQueries.incrementOtpAttempts(otpRecord.id)
        throw new ApiError(
            400,
            "INVALID_OTP",
            "Invalid OTP"
        )
    }

    await runInTransaction(async (connection) =>{
        await authQueries.markOtpVerified(otpRecord.id, connection);
        await authQueries.markEmailVerified(user.id, connection);
    });


    const welcomeHtmlContent = welcomeEmailTemplate({
        firstName: user.first_name,
    })

    await sendEmail({
        to: user.email,
        subject: "Welcome to Authentication API",
        html: welcomeHtmlContent
    })

    return {
        message: "Email verified successfully"
    }
}

export const resendOtp = async ({email}) => {
    const user = await authQueries.findUserByEmail(email)
    if(!user){
        throw new ApiError(
            404,
            "USER_NOT_FOUND",
            "User not found"
        )
    }
    if(user.is_email_verified){
        throw new ApiError(
            409,
            "EMAIL_ALREADY_VERIFIED",
            "Email is already verified"
        )
    }

    const latestOtp = await authQueries.findLatestOtp({
        userId: user.id,
        purpose: "email_verification"
    })
    if(latestOtp){
        const secondsSinceCreation = (Date.now() - new Date(latestOtp.created_at).getTime()) / 1000
        if(secondsSinceCreation < config.otp.resendCooldownSeconds){
            throw new ApiError(
                429,
                "OTP_COOLDOWN",
                "Please wait before requesting another OTP"
            )
        }
    }

    const otpCount = await authQueries.countRecentOtps({
        userId: user.id,
        purpose: "email_verification",
    });

    if (otpCount >= config.otp.maxRequestsPerHour) {
        throw new ApiError(
            429,
            "OTP_LIMIT_EXCEEDED",
            "Too many OTP requests. Please try again later."
        );
    }
    
    const otp = otpService.generateOtp()
    const otpHash = await otpService.hashOtp(otp)

    const expiresAt = otpService.getOtpExpiration()

    await runInTransaction(async (connection) => {
        await authQueries.invalidateActiveOtps(
            { userId: user.id, purpose: "email_verification" },
            connection
        )

        await authQueries.createOtp(
            {
                userId: user.id,
                otpHash,
                purpose: "email_verification",
                expiresAt
            },
            connection
        )
    })


    const htmlContent = otpEmailTemplate({
        firstName: user.first_name,
        otp
    })

    await sendEmail({
        to: email,
        subject: "Resend OTP",
        html: htmlContent
    })

    return {
        message: "A new verification OTP has been sent"
    }
}
