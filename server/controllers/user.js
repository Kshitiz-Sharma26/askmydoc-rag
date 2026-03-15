import { configDotenv } from "dotenv";
import getQueryTool from "../database/db-connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
configDotenv();

const jwt_secret = process.env.JWT_SECRET;
const queryTool = getQueryTool();

export async function login(req, resp) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return resp.status(400).json({
        message: "Username or password missing.",
      });
    }

    // Check if user exists or not
    const r = await queryTool`SELECT * FROM "User" WHERE email = ${username}`;
    console.log(r);
    if (r.length != 1) {
      return resp.status(404).json({
        message: "User not found.",
      });
    }
    const { email, id, password: password_hash } = r[0];
    const match = await bcrypt.compare(password, password_hash);

    if (!match) {
      return resp.status(401).json({
        message: "Incorrect password.",
      });
    }

    // Make refresh and access token for user to use.
    // Save access token in DB against the user.

    const refresh_token = jwt.sign(
      {
        email,
        id,
      },
      jwt_secret,
      { expiresIn: "30d" }
    );

    // Access token: Expires in 30 minutes
    const access_token = jwt.sign(
      {
        email,
        id,
      },
      jwt_secret,
      { expiresIn: 30 * 60 * 1000 }
    );
    await queryTool`UPDATE "User" set refresh_token = ${refresh_token} WHERE id = ${id}`;
    resp.cookie("med-access", access_token, {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      sameStie: "Strict",
    });

    return resp.status(200).json({
      data: {
        email,
        id,
      },
      message: "User logged in successfully",
    });
  } catch (error) {
    console.log("error:", error);
    return resp.status(500).json({
      message: "Server error",
    });
  }
}

export async function logout(req, resp) {
    
}