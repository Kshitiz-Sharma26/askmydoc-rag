import { Router } from "express";
import { getToken, login, logout, signup } from "../Controllers/user.js";
export const router = Router();

// middleware that is specific to this router

router.post("/login", login);
router.post("/signup", signup);
router.delete("/logout", logout);
router.get("/refresh-token", getToken);
