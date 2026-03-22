import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { router as authRouter } from "./routes/auth.js";
import { router as fileRouter } from "./routes/file.js";
import { router as searchRouter } from "./routes/search.js";
import authorization from "./middlewares/authorization.js";

configDotenv();

const PORT = process.env.PORT;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/file", authorization, fileRouter);
app.use("/search", authorization, searchRouter);

app.listen(PORT, () => {
  console.log("Server listening at port: ", PORT);
});
