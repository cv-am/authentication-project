import jwt from "jsonwebtoken";

export const authVerify = async (req,res,next) => {
    try {
        const token = req.cookies.token

        if(!token){
            return res.status(401).json({message:"Please login to go ahead!"})
        }

        const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decodeToken
        next()
        
    } catch (error) {
        console.log("Auth Middleware Error:",error)
        return res.status(401).json({message:"Invalid or expired token. Please log in again."})
    }
}