import express from "express";
import {
  editUserProfile,
  followOrUnfollow,
  getSuggestedUsers,
  getUser,
  logIn,
  logOut,
  signUp,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload } from "../middleware/multer.js";

const userRoutes = express.Router();

userRoutes.post("/api/user/signup", signUp);
userRoutes.post("/api/user/login", logIn);
userRoutes.post("/api/user/logout", logOut);
userRoutes.get("/api/user/getuser/:id", isAuthenticated, getUser);
userRoutes.post(
  "/api/user/edit_profile",
  isAuthenticated,
  upload.single("profilePicture"),
  editUserProfile
);
userRoutes.get("/api/user/suggested_user", isAuthenticated, getSuggestedUsers);
userRoutes.post(
  "/api/user/follow_unfollow/:id",
  isAuthenticated,
  followOrUnfollow
);

export default userRoutes;
