import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:"Too many requests from this IP, please try again later"
})

export const registerLimiter = rateLimit({
    windowMs:60*60*1000,
    max:5,
    message:"Too many requests from this IP, please try again later"
})

export const loginLimiter = rateLimit({
    windowMs:60*60*1000,
    max:5,
    message:"Too many requests from this IP, please try again later"
})


