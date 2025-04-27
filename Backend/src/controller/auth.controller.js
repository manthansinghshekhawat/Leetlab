import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "../generated/prisma/index.js";
import { db } from "../libs/db.js";
export const register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      error: "Email, password and name are required",
    });
  }
  try {
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User alreday exist",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER,
      },
    });
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.status(200).json({
      message: "User Created Sucesfully ",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log("error cerating a user", error);
    return res.status(500).json({
      message: "error creating user ",
      error: error,
    });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.status(200).json({
      success: true,
      message: "user logged out successfully ",
    });
  } catch (error) {
    console.log("error Logging out  a user", error);
    return res.status(500).json({
      message: "error Logging out  user ",
      error: error,
    });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(401).json({
        error: "User not Found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid Credentails",
      });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.status(200).json({
      message: "User Logged Sucesfully ",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("error Logging in  a user", error);
    return res.status(500).json({
      message: "error Logging in  user ",
      error: error,
    });
  }
};
export const check = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User authenticated sucessfully ",
    });
  } catch (error) {
    console.log("error Cheking  a user", error);
    return res.status(500).json({
      message: "error Cheking user ",
      error: error,
      user: req.user,
    });
  }
};
