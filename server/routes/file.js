import express from "express";
import upload from "../utils/multer.js";
import { deleteFile, uploadFile, getFiles } from "../controllers/file.js";

export const router = express.Router();

router.get("/", getFiles);
router.post("/", upload.single("report"), uploadFile);
router.delete("/:id", deleteFile);
