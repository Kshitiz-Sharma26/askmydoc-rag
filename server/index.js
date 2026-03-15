import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { router as userRouter } from "./routes/user.js";

configDotenv();

const PORT = process.env.PORT;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log("Server listening at port: ", PORT);
});
