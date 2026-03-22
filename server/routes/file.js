import express from "express";
import upload from "../utils/multer.js";
import { deleteFile, uploadFile } from "../controllers/file.js";

export const router = express.Router();

router.post("/", upload.single("report"), uploadFile);
router.delete("/:id", deleteFile);
