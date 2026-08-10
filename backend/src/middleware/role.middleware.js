

export const roleVerify = (arr) =>{

    return (req,res,next) => {
        try {
            const role = req.user.role
            if (!role) {
                return res.status(400).json({
                    message: "Role is required for accessing this"
                })
            }
            if (!arr.includes(role)) {
                return res.status(403).json({
                    message: "You are not authorized to access this"
                })
            }
            next()
        } catch (error) {
            console.log(error)
        }
    }
}
        
