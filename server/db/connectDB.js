import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/blogDB");
    console.log("db connected successful");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
