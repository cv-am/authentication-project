import bcrypt from "bcrypt"
import { config } from "../config/env.js"

export const hashPassword = async (password) => {
    return bcrypt.hash(password, config.bcrypt.saltRounds)
}

export const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash)
}