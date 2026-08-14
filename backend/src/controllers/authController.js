import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { env } from "../config/env.js";

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: "30d" });
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
};

export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};