import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();

const jwt_secret = process.env.JWT_SECRET;

const authorization = (req, resp, next) => {
  const access_token = req.cookies["med-access"];
  if (!access_token) {
    return resp.status(403).json({
      message: "User not logged in.",
    });
  }
  try {
    const decoded = jwt.verify(access_token, jwt_secret);
    req.user = {
      id: decoded.id,
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return resp.status(403).json({
        message: "Access token expired.",
      });
    }
    return resp.status(403).json({
      message: "User not authorized to perform this action.",
    });
  }
};

export default authorization;
