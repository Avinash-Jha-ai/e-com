import mongoose from "mongoose";
import { configs } from "../configs/config.js";

let connectionPromise;

const connectMongoDb = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(configs.MONGO_URL)
      .then((connection) => {
        console.log("✅ mongo db connected successfully");
        return connection.connection;
      })
      .finally(() => {
        connectionPromise = null;
      });
  }

  return connectionPromise;
};

export default connectMongoDb;
