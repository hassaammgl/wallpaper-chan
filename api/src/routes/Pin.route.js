import express from "express";
import { getPin, getPins, createPin, interactionCheck, interact, getPinDownload } from "../controllers/pin.controller.js"
import { protect, optionalAuth } from "../middlewares/auth.middlewares.js";

const pinRouter = express.Router();

pinRouter.get("/", getPins);
pinRouter.get("/:id/download", getPinDownload);
pinRouter.get("/:id", getPin);
pinRouter.post("/", protect, createPin)
pinRouter.get("/interaction-check/:id", optionalAuth, interactionCheck)
pinRouter.post("/interact/:id", protect, interact)
export default pinRouter;
