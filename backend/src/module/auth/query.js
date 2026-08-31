import pool from "../../db/db.js";


export const findUserByEmail = async (email, db = pool) => {
    const [rows] = await db.query(
        "SELECT id, email, password_hash, is_email_verified, status FROM users WHERE email = ? LIMIT 1",
        [email]
    );

    return rows[0] || null;
};

export const createUser = async ({ firstName, lastName, email, hashedPassword }, db= pool) => {
    const [result] = await db.query(
        "INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)",
        [firstName, lastName, email, hashedPassword]
    );
    return result.insertId;
};

export const createVerificationToken = async ({ userId, tokenHash, expiresAt }, db=pool) => {
    const [result] = await db.query(
        "INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
        [userId, tokenHash, expiresAt]
    );
    return result.insertId;
};

export const createOtp = async ({userId, otpHash, purpose, expiresAt}, db=pool) => {
    const [result] = await db.query(
        "INSERT INTO otp_codes (user_id, otp_hash, purpose, expires_at) VALUES (?, ?, ?, ?)",
        [userId, otpHash, purpose, expiresAt]
    );
    return result.insertId;    
}

export const findActiveOtp = async ({userId, purpose}, db=pool) => {
    const [rows] = await db.query(
        "SELECT id, user_id, otp_hash, attempts, expires_at, verified_at FROM otp_codes WHERE user_id = ? AND purpose = ? AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1",
        [userId, purpose]
    );
    return rows[0] || null;
}

export const incrementOtpAttempts = async (otpId, db=pool) => {
    await db.query(
        "UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?",
        [otpId]
    )
}

export const markOtpVerified = async (otpId, db=pool) => {
    await db.query(
        "UPDATE otp_codes SET verified_at = CURRENT_TIMESTAMP WHERE id = ?",
        [otpId]
    )
}

export const markEmailVerified = async (userId, db=pool) => {
    await db.query(
        "UPDATE users SET is_email_verified = TRUE WHERE id = ?",
        [userId]
    )
}

export const findLatestOtp = async ({userId, purpose}, db = pool) => {
    const [rows] = await db.query(
        "SELECT id, created_at, expires_at, attempts, verified_at FROM otp_codes WHERE user_id = ? AND purpose = ? ORDER BY created_at DESC LIMIT 1",
        [userId, purpose]
    )
    return rows[0] || null
}


export const invalidateActiveOtps = async ({userId, purpose}, db = pool) => {
    await db.query(
        "UPDATE otp_codes SET verified_at = CURRENT_TIMESTAMP WHERE user_id = ? AND purpose = ? AND verified_at IS NULL",
        [userId, purpose]
    )
}

export const countRecentOtps = async ({userId, purpose}, windowMinutes = 60, db=pool) => {
    const [rows] = await db.query(
        "SELECT COUNT(*) as count FROM otp_codes WHERE user_id = ? AND purpose = ? AND created_at >= ?",
        [userId, purpose, new Date(Date.now() - windowMinutes * 60 * 1000)]
    )
    return rows[0].count
}