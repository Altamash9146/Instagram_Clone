import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ConnectDb from "./config/Config.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use(cookieParser());
ConnectDb();

// !User Routes //
app.use(userRoutes);
// !User Routes //

const port = process.env.port;
app.listen(port, () => {
  console.log(`express server is running on port ${port}`);
});
