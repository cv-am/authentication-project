import express from "express";
import { authVerify } from "../middleware/auth.middleware.js";
import { userRegistrationRules,userLoginRules,validateResult } from "../middleware/validation.middleware.js";
import { roleVerify } from "../middleware/role.middleware.js";
import { registerLimiter,loginLimiter } from "../middleware/rate-limit.middleware.js";
import { 
    userRegistration,
    userLogin,
    userProfile,
    userUpdate,
    changePassword,
    deleteProfile,
    userLogout,
    getAllUser,
    removeUser
} from "./controller.js";

const route = express.Router()

route.post("/register",registerLimiter,userRegistrationRules,validateResult,userRegistration)
route.post("/login",loginLimiter,userLoginRules,validateResult,userLogin)
route.get("/profile",authVerify,userProfile)
route.put("/profile/update",authVerify,userUpdate)
route.patch("/password",authVerify,changePassword)
route.delete("/profile/remove",authVerify,deleteProfile)
route.get("/logout",authVerify,userLogout)
route.get("/admin/alluser",authVerify,roleVerify(["admin","manager"]),getAllUser)
route.delete("/admin/remove",authVerify,roleVerify(["admin"]),removeUser)

export default route  