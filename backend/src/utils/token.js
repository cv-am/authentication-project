import jwt from "jsonwebtoken"
import { config } from "../config/env.js"

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.jwt.refreshTokenSecret, {
        expiresIn: config.jwt.refreshTokenExpiry
    })
}

const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.jwt.accessTokenSecret, {
        expiresIn: config.jwt.accessTokenExpiry
    })
}

export { generateAccessToken, generateRefreshToken }