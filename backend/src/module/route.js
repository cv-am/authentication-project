import express from "express";
import { authVerify } from "../middleware/auth.middleware.js";
import { userRegistrationRules,validateResult } from "../middleware/validation.middleware.js";
import { roleVerify } from "../middleware/role.middleware.js";
import { 
    userRegistration,
    userLogin,
    userProfile,
    userUpdate,
    changePassword,
    deleteProfile,
    userLogout,
    getAllUser
} from "./controller.js";

const route = express.Router()

route.post("/register",validateResult,userRegistration)
route.post("/login",userLogin)
route.get("/profile",authVerify,userProfile)
route.put("/profile/update",authVerify,userUpdate)
route.patch("/password",authVerify,changePassword)
route.delete("/profile/remove",authVerify,deleteProfile)
route.get("/logout",authVerify,userLogout)
route.get("/getall",authVerify,roleVerify(["admin","manager"]),getAllUser)

export default route  