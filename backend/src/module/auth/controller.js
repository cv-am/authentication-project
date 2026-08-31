import * as authService from "./service.js"

export const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);

        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const result = await authService.verifyEmail(req.body)

        return res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error)
    }
}

export const resendOtp = async (req, res, next) => {
    try {
        const result = await authService.resendOtp(req.body)

        return res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        next(error)
    }
}