import { Router } from "express";
import { getToken, login, logout, signup } from "../controllers/user.js";
export const router = Router();

// middleware that is specific to this router

router.post("/login", login);
router.post("/signup", signup);
router.delete("/logout", logout);
router.get("/check-token", getToken);
