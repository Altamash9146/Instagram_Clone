import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGO_URL;

async function ConnectDb() {
   try {
    await mongoose.connect(url);
    console.log("mongoose connected successfully");
   } catch (error) {
    console.log("error connecting mongoose", error); 
   }
}

export default ConnectDb