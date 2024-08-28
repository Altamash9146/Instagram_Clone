import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(404).json({ message: "Fill all the details" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: `${email} is already registered` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = await jwt.sign({ userId: newUser }, process.env.secretKey, {
      expiresIn: "1d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `${username} your created successfully`,
        success: true,
      });
  } catch (error) {
    console.log("signup error", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).json({ message: "Fill all the details" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: `${email} not found` });
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
      bookmarks: user.bookmarks,
    };

    const token = jwt.sign({ userId: user._id }, process.env.secretKey, {
      expiresIn: "1d",
    });

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.name}`,
        success: true,
      });
  } catch (error) {
    console.log("login error", error);
    return res.send(500).json({ message: "Internal Server Error" });
  }
};

export const logOut = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!email) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.cookie("token", "", { maxAge: 0 }).json({
      message: `${user.username} logged out successfully`,
      success: true,
    });
  } catch (error) {
    console.log("logOut error", error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        
        if(!user){
            return res.status(404).json({message: "User not found"})
        }

        return res.json(user);

    } catch (error) {
        console.log("getUser error", error);
        return res.status(500).json({message: "Internal server error"})
    }
}
