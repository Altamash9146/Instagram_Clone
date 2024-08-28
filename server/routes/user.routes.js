import express from "express";
import {
  getUser,
  logIn,
  logOut,
  signUp,
} from "../controllers/user.controller.js";

const userRoutes = express.Router();

userRoutes.post("/api/user/signup", signUp);
userRoutes.post("/api/user/login", logIn);
userRoutes.post("/api/user/logout", logOut);
userRoutes.get("/api/user/getuser/:id", getUser);

export default userRoutes;
