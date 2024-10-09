import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getDataUri } from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
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
        message: `${username} your account created successfully`,
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

    const userData = {
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
        message: `Welcome back ${user.username}`,
        success: true,
        user: userData,
      });
  } catch (error) {
    console.log("login error", error);
    return res.status(500).json({ message: "Internal Server Error" });
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
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.log("getUser error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const editUserProfile = async (req, res) => {
  try {
  
    const userId = req.user;    

    const { bio, gender } = req.body;
    const profilePicture = req.file;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    const { password, ...updatedUser } = user.toObject();

    return res.status(200).json({
      message: "Profile updated sucessfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUser = await User.find({ _id: { $ne: req.user } }).select(
      "-password"
    );
    if (!suggestedUser) {
      return res.status(404).json({ message: "No suggested users" });
    }
    return res.status(200).json({ success: true, users: suggestedUser });
  } catch (error) {
    console.log(error);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followers = req.user;
    const following = req.params.id;

    // console.log("Followers ID:", followers);
    // console.log("Following ID:", following);

    if (followers === following) {
      return res
        .status(400)
        .json({ message: "You cannot follow or unfollow yourself" });
    }

    const user = await User.findById(followers);
    const targetUser = await User.findById(following);

    if (!user || !targetUser) {
      return res
        .status(404)
        .json({ message: "user not found", success: false });
    }

    const isFollowing = user.following.includes(following);
    if (isFollowing) {
      await Promise.all([
        User.updateOne({ _id: followers }, { $pull: { following: following } }),
        User.updateOne({ _id: following }, { $pull: { followers: followers } }),
      ]);
      return res
        .status(200)
        .json({ message: "unfollowed sucessfully", success: true });
    } else {
      await Promise.all([
        User.updateOne({ _id: followers }, { $push: { following: following } }),
        User.updateOne({ _id: following }, { $push: { followers: followers } }),
      ]);
      return res
        .status(200)
        .json({ message: "followed sucessfully", success: true });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};
