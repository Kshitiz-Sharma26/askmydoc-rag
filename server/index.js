import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import getQueryTool from "./database/db-connection.js";
import { login } from "./Controllers/user.js";
configDotenv();

const PORT = process.env.PORT;

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

const queryTool = getQueryTool();

app.get("/", login);

app.listen(PORT, () => {
  console.log("Server listening at port: ", PORT);
});
