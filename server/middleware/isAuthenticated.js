import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "User not authenticated", success: false });
    }

    const decode = await jwt.verify(token, process.env.secretKey);
    // console.log(decode);
    if (!decode) {
      return res.status(401).json({ message: "Invalid", success: false });
    }

    req.user = decode.userId;

    next();
  } catch (error) {
    console.log(error);
  }
};
