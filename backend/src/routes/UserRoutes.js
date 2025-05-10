import express from "express";
import { forgotPassword, getAllUser, Login, resetPassword, Signup, Userprofile, verifyOtp } from "../controllers/Usercontroller.js";
import upload from "../middleware/Multer.middleware.js";
import { getDashboardStats } from "../controllers/DashboardController.js";
import authMiddleware from "../middleware/Auth.middleware.js";

const router = express.Router();

router.post("/Signup", upload.single("profileImage"), Signup);
router.post("/Login", Login);
router.get("/getAllUsers" , getAllUser)
router.get("/profile"  , Userprofile )
router.post("/forgotpassword", forgotPassword);
router.post("/verifyotp", verifyOtp);
router.post("/resetpassword", resetPassword);
router.get("/stats",  getDashboardStats);


export default router;
