import express from "express";
import { searchQuery } from "../controllers/search.js";

export const router = express.Router();

router.post("/", searchQuery);
