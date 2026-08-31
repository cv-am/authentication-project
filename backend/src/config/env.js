import dotenv from "dotenv"

dotenv.config()

export const config = {
    port : Number(process.env.PORT),
    db:{
        dbHost: process.env.DB_HOST,
        dbUser: process.env.DB_USER,
        dbPass: process.env.DB_PASS,
        dbName: process.env.DB_NAME
    },
    jwt:{
        jwtSecret: process.env.JWT_SECRET
    },
    bcrypt:{
        saltRounds: Number(process.env.BCRYPT_SALT)
    },
    smtp:{
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
        from: process.env.SMTP_FROM
    },
    otp:{
        expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES) || 10,
        maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
        resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60,
        maxRequestsPerHour: Number(process.env.OTP_MAX_REQUESTS_PER_HOUR) || 5
    }
}