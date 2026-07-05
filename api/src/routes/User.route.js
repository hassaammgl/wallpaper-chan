import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import 
{ 
    getUser , 
    followUser,
} 
from "../controllers/User.controller.js";

const router = express.Router();
router.get("/:userName" , getUser);
router.post("/follow/:userName" ,verifyToken, followUser)

export default router;