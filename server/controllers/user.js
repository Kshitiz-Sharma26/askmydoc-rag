import { configDotenv } from "dotenv";
import getQueryTool from "../database/db-connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
configDotenv();

const jwt_secret = process.env.JWT_SECRET;
const queryTool = getQueryTool();

export async function getToken(req, res) {
  const refresh_token = req.cookies["med-refresh"];

  if (!refresh_token) {
    return res.status(401).json({ message: "User not logged in." });
  }

  // Verify and decode refresh token
  let decoded;
  try {
    decoded = jwt.verify(refresh_token, jwt_secret);
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token." });
  }

  const { id, email } = decoded;

  // Check refresh token matches DB
  const users = await queryTool`SELECT * FROM "User" WHERE id = ${id}`;
  if (users[0]?.refresh_token !== refresh_token) {
    return res.status(401).json({ message: "Invalid Refresh token." });
  }

  // Rotate tokens
  const new_refresh_token = jwt.sign({ id, email }, jwt_secret, {
    expiresIn: "7d",
  });
  const new_access_token = jwt.sign({ id, email }, jwt_secret, {
    expiresIn: "30m",
  });

  // Save new refresh token
  await queryTool`UPDATE "User" SET refresh_token = ${new_refresh_token} WHERE id = ${id}`;

  // Set cookies
  res.cookie("med-access", new_access_token, {
    maxAge: 30 * 60 * 1000, // 30 min in ms
    httpOnly: true,
    sameSite: "Strict",
  });
  res.cookie("med-refresh", new_refresh_token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    httpOnly: true,
    sameSite: "Strict",
  });

  return res.status(200).json({
    data: { id, email },
    message: "Tokens refreshed successfully.",
  });
}

export async function signup(req, resp) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return resp.status(400).json({
        message: "Username or password missing.",
      });
    }

    // Check if user exists or not
    const user_resp =
      await queryTool`SELECT * FROM "User" WHERE email = ${username}`;
    if (user_resp.length == 1) {
      return resp.status(403).json({
        message: "User already exists.",
      });
    }

    const password_hash = await bcrypt.hash(password, 5);
    const created_user =
      await queryTool`INSERT INTO "User"(email, password) VALUES(${username}, ${password_hash}) RETURNING *`;

    return resp.status(200).json({
      data: { id: created_user[0].id },
      message: "User created successfully",
    });
  } catch (error) {
    console.log("error:", error);
    return resp.status(500).json({
      message: "Server error",
    });
  }
}

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
      { expiresIn: "7d" }
    );

    // Access token: Expires in 30 minutes
    const access_token = jwt.sign(
      {
        email,
        id,
      },
      jwt_secret,
      { expiresIn: "30m" }
    );
    await queryTool`UPDATE "User" set refresh_token = ${refresh_token} WHERE id = ${id}`;
    resp.cookie("med-access", access_token, {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      sameSite: "Strict",
    });
    resp.cookie("med-refresh", refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "Strict",
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
  try {
    const { id } = req.body ?? {};

    if (!id) {
      return resp.status(400).json({
        message: "User Id is missing.",
      });
    }

    // Check if user exists or not
    const r = await queryTool`SELECT * FROM "User" WHERE id = ${id}`;

    if (r.length != 1) {
      return resp.status(404).json({
        message: "User not found.",
      });
    }

    await queryTool`UPDATE "User" set refresh_token = null WHERE id = ${id}`;

    resp.clearCookie("med-access");

    resp.clearCookie("med-refresh");

    return resp.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log("error:", error);
    return resp.status(500).json({
      message: "Server error",
    });
  }
}
