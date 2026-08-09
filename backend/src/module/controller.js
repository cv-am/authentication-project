import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { 
    registerUser,
    getUser,
    profileUser,
    updateUser,
    updatePassword,
    deleteUser 
} from "./query.js"

export const userRegistration = async (req,res) => {
    try {
        const { name, username, email, password } = req.body
        if (!name || !username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }
        const isExist = await getUser([username])
        if (isExist.length > 0) {
            return res.status(409).json({
                message: "User already exists!"
            })
        }
        const hashPass = await bcrypt.hash(password, 10)
        const result = await registerUser([name, username, email, hashPass])
        if (result.affectedRows === 0) {
            return res.status(500).json({
                message: "Registration failed!"
            })
        }
        res.json({
            message: "User registered successfully"
        })
    } catch (error) {
        console.log(error)
    }
}

export const userLogin = async (req,res) => {
    try {
        const { username, password } = req.body

        const [user] = await getUser([username])
        if (!user || user.length === 0) {
            return res.status(401).json({
                message: "Try to register first."
            })
        }

        const isPassValid = await bcrypt.compare(password, user.password)
        if (!isPassValid) {
            return res.status(400).json({
                message: "Incorrect password!"
            })
        }

        const token = await jwt.sign(
            {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 3600000
        })

        res.json({
            message: `${user.username} logged in successfully`
        })
    } catch (error) {
        console.log(error)
    }
}

export const userProfile = async (req,res) => {
    try {
        const id = req.user.id
        const [result] = await profileUser([id])
        res.json({
            profile:result
        })
    } catch (error) {
        console.log(error)
    }
}

export const userUpdate = async (req,res) => {
    try {
        const {name,username,email} = req.body
        const id = req.user.id
        if( !name || !username || !email){
            return res.status(400).json({message:"All fields are required!"})
        }
        const result = await updateUser([name,username,email,id])
        if(result.affectedRows===0){
            return res.status(500).json({message:"Profile update failed"})
        }
        res.json({message:"Profile updated successfully"})
    } catch (error) {
        console.log(error)
    }
}

export const changePassword = async (req,res) => {
    try {
        const { currentPass,newPass } = req.body
        const user = req.user
        const [result] = await getUser([user.username])

        if( !currentPass || !newPass ){
            return res.status(400).json({message:"Both fields are required!"})
        }

        const verifyOld = await bcrypt.compare(currentPass,result.password )
        if(!verifyOld){
            return res.status(401).json({message:"Old password doesn't matched!"})
        }

        const hashPass = await bcrypt.hash(newPass,10)
        const changePass = await updatePassword([hashPass,user.id])
        if(changePass.affectedRows===0){
            return res.status(500).json({message:"Failed to change password"})
        }
        res.clearCookie("token")
        res.json({message:"Password changed successfully, please login again"})

    } catch (error) {
        console.log(error)
    }
}

export const deleteProfile = async (req,res) => {
    try {
        const user = req.user
        const {password} = req.body
        const [result] = await getUser([user.username])
        
        if(!password){
            return res.status(400).json({message:"Password is required!"})
        }
    
        const verifyPass = await bcrypt.compare(password, result.password)
    
        if(!verifyPass){
            return res.status(401).json({message:"Please enter correct password!"})
        }
    
        const remove = await deleteUser([user.id])
        if(remove.affectedRows===0){
            return res.status(500).json({message:"Failed to remove profile"})
        }
    
        res.clearCookie("token")
        res.json({message:"Removed user's profile!"})
    } catch (error) {
        console.log(error)
    }
}

export const userLogout = async (req,res) => {
    try {
        res.clearCookie("token")
        res.json({message:"User logged out!"})
    } catch (error) {
        console.log(error)
    }

}