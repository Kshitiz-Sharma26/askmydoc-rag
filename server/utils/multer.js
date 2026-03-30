import { fileURLToPath } from "url";
import multer from "multer";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../tmp/my-uploads");
fs.mkdirSync(uploadDir, { recursive: true }); // ← creates dir if it doesn't exist

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const file_name = file.originalname + "-" + Math.round(Math.random() * 1e9);
    cb(null, file_name + ".pdf");
  },
});

const upload = multer({ storage });

export default upload;
