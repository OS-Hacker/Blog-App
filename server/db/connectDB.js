import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.blogDB);
    console.log("db connected successful");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
