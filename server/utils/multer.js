import { fileURLToPath } from "url";
import multer from "multer";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../tmp/my-uploads"));
  },
  filename: function (req, file, cb) {
    const file_name = file.originalname + "-" + Math.round(Math.random() * 1e9);
    cb(null, file_name + ".pdf");
  },
});

const upload = multer({ storage: storage });

export default upload;
