import mongoose from "mongoose";
import { configs } from "../configs/config.js";
const connectMongoDb = async () => {
  await mongoose.connect(configs.MONGO_URL);
  console.log("✅ mongo db connected successfully");
};

export default connectMongoDb;
