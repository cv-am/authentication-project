import express from "express";
import { authVerify } from "../middleware/auth.middleware.js"
import { 
    userRegistration,
    userLogin,
    userProfile,
    userUpdate,
    changePassword,
    deleteProfile,
    userLogout
} from "./controller.js";

const route = express.Router()

route.post("/register",userRegistration)
route.post("/login",userLogin)
route.get("/profile",authVerify,userProfile)
route.put("/profile/update",authVerify,userUpdate)
route.patch("/password",authVerify,changePassword)
route.delete("/profile/remove",authVerify,deleteProfile)
route.get("/logout",authVerify,userLogout)

export default route