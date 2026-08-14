import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, env.jwtSecret);
  req.user = await User.findById(decoded.id).select("-password");
  next();
};