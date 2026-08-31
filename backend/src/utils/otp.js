import crypto from "crypto"
import bcrypt from "bcrypt"
import { config } from "../config/env.js"

export const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString()
}


export const hashOtp = async (otp) => {
    return await bcrypt.hash(otp, config.bcrypt.saltRounds)
}

export const verifyOtp = async (otp, otpHash) => {
    return await bcrypt.compare(otp, otpHash)
}


export const getOtpExpiration = () => {
    return new Date(Date.now() + config.otp.expiryMinutes * 60 * 1000)
}